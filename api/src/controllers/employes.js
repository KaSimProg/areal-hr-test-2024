const { pool } = require('../db/database');
require('dotenv').config(); // Загружаем переменные окружения

// Функция для получения всех сотрудников с деталями их департамента, должности и пути к файлу
const getAllEmployees = async (req, res) => {
  try {
    const query = `
      SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        e.middle_name,
        e.date_of_birth,
        e.passport_details,
        e.passport_issue_date,
        e.address,
        e.salary,
        p.name AS position_name,
        d.name AS department_name,
        o.name AS organization_name,
        f.file_path
      FROM 
        employees e
      LEFT JOIN 
        hr_operations ho ON e.employee_id = ho.employee_id
      LEFT JOIN 
        positions p ON ho.position_id = p.position_id
      LEFT JOIN 
        departments d ON ho.departments_id = d.departments_id
      LEFT JOIN 
        organizations o ON d.organizations_id = o.organizations_id
      LEFT JOIN 
        files f ON e.employee_id = f.employee_id
      WHERE 
        ho.status != 'Уволен';
    `;
    
    const result = await pool.query(query);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows); // Отправляем все строки как JSON
    } else {
      res.status(404).json({ error: 'Сотрудники не найдены' });
    }
  } catch (err) {
    console.error('Ошибка при выполнении запроса:', err);
    res.status(500).json({ error: 'Ошибка при выполнении запроса' });
  }
};

// Функция для добавления нового сотрудника с поддержкой транзакций, добавлением в hr_operations и файла
const addEmployee = async (req, res) => {
  const { 
    first_name, last_name, middle_name, date_of_birth, 
    passport_details, passport_issue_date, address, salary, 
    position_name, department_name, organization_name, file_path,
    userId 
  } = req.body;

  const file = req.file; // Получаем файл
  console.log("Полученный файл:", file);  // Логируем файл
  const filePath = file ? `/img/${file.filename}` : null; // Путь к файлу
  console.log("Путь к файлу:", filePath);  // Логируем путь к файлу


  const client = await pool.connect();

  try {
    // Получаем или создаем организацию, департамент и позицию
    const organizationId = await getOrCreateOrganization(organization_name);
    const departmentId = await getOrCreateDepartment(department_name, organizationId);
    const positionId = await getOrCreatePosition(position_name);

    // Выполнение всех операций добавления сотрудника
    const employeeResult = await client.query(
      `INSERT INTO employees (
        last_name, first_name, middle_name, date_of_birth, 
        passport_details, passport_issue_date, address, salary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING employee_id`,
      [
        last_name, first_name, middle_name, date_of_birth,
        passport_details, passport_issue_date, address, salary,
      ]
    );

    const employeeId = employeeResult.rows[0].employee_id;

    // Добавление записи в hr_operations
    await client.query(
      `INSERT INTO hr_operations (employee_id, departments_id, position_id, status)
      VALUES ($1, $2, $3, 'Работает')`,
      [employeeId, departmentId, positionId]
    );

    if (filePath) {
      // Сохраняем путь к файлу, если файл был загружен
      await client.query(
        `INSERT INTO files (employee_id, file_name, file_path)
        VALUES ($1, $2, $3)`,
        [employeeId, file.originalname, filePath]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ message: 'Сотрудник успешно добавлен', employeeId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Ошибка в addEmployee:", err);
    res.status(500).json({ error: 'Ошибка при добавлении сотрудника' });
  } finally {
    client.release();
  }
};

// Функция для мягкого увольнения сотрудника
const softDeleteEmployee = async (req, res) => {
  const { employee_id } = req.body; // Получаем id сотрудника из запроса

  const client = await pool.connect();

  try {
    // Обновляем статус сотрудника на "Уволен"
    const result = await client.query(
      `UPDATE hr_operations
      SET status = 'Уволен'
      WHERE employee_id = $1 AND status != 'Уволен'`, 
      [employee_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Сотрудник не найден или уже уволен' });
    }

    // Если операция прошла успешно
    res.status(200).json({ message: 'Сотрудник успешно уволен (мягкий метод)' });
  } catch (err) {
    console.error('Ошибка при увольнении сотрудника:', err);
    res.status(500).json({ error: 'Ошибка при увольнении сотрудника' });
  } finally {
    client.release();
  }
};

// Дополнительные функции для получения или создания организаций, департаментов и позиций
const getOrCreateOrganization = async (organization_name) => {
  try {
    const result = await pool.query(`
      INSERT INTO organizations (name)
      VALUES ($1)
      ON CONFLICT (name) DO NOTHING
      RETURNING organizations_id;
    `, [organization_name]);

    if (result.rows.length === 0) {
      const res = await pool.query('SELECT organizations_id FROM organizations WHERE name = $1', [organization_name]);
      return res.rows[0].organizations_id;
    } else {
      return result.rows[0].organizations_id;
    }
  } catch (err) {
    console.error('Ошибка при получении или создании организации:', err);
    throw new Error('Ошибка при работе с организацией');
  }
};

const getOrCreateDepartment = async (department_name, organizationId) => {
  const result = await pool.query(
    `SELECT departments_id FROM departments WHERE name = $1 AND organizations_id = $2`,
    [department_name, organizationId]
  );
  if (result.rows.length > 0) {
    return result.rows[0].departments_id;
  } else {
    const insertResult = await pool.query(
      `INSERT INTO departments (name, organizations_id) VALUES ($1, $2) RETURNING departments_id`,
      [department_name, organizationId]
    );
    return insertResult.rows[0].departments_id;
  }
};

const getOrCreatePosition = async (position_name) => {
  const result = await pool.query(
    `SELECT position_id FROM positions WHERE name = $1`,
    [position_name]
  );
  if (result.rows.length > 0) {
    return result.rows[0].position_id;
  } else {
    const insertResult = await pool.query(
      `INSERT INTO positions (name) VALUES ($1) RETURNING position_id`,
      [position_name]
    );
    return insertResult.rows[0].position_id;
  }
};

module.exports = { 
  getAllEmployees, 
  addEmployee, 
  softDeleteEmployee 
};
