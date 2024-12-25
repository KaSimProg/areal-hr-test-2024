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
        e.address,
        e.salary,
        p.name AS position_name,
        d.name AS department_name,
        o.name AS organization_name,
        f.file_path  -- Добавляем поле file_path из таблицы files
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
        files f ON e.employee_id = f.employee_id;
    `;
    
    // Выполнение запроса к базе данных
    const result = await pool.query(query); // Нет необходимости передавать employeeId, так как мы выбираем всех сотрудников

    // Проверяем, есть ли данные
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

// Экспортируем функцию
module.exports = { getAllEmployees };
