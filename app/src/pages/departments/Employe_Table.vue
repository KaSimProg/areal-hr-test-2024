<template>
  <div class="employee-table">
    <h1 class="title">Список Сотрудников</h1>

    <!-- Таблица с данными сотрудников -->
    <table class="table" v-if="employees.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Имя</th>
          <th>Фамилия</th>
          <th>Отчество</th>
          <th>Дата рождения</th>
          <th>Паспортные данные</th>
          <th>Дата выдачи паспорта</th>
          <th>Адрес</th>
          <th>Зарплата</th>
          <th>Должность</th>
          <th>Отдел</th>
          <th>Организация</th>
          <th>Фото</th>
          <th>Actions</th> <!-- Новый столбец для кнопки удаления -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="employee in employees" :key="employee.employee_id">
          <td>{{ employee.employee_id }}</td>
          <td>{{ employee.first_name }}</td>
          <td>{{ employee.last_name }}</td>
          <td>{{ employee.middle_name }}</td>
          <td>{{ formatDate(employee.date_of_birth) }}</td>
          <td>{{ employee.passport_details }}</td>
          <td>{{ formatDate(employee.passport_issue_date) }}</td>
          <td>{{ employee.address }}</td>
          <td>{{ employee.salary }}</td>
          <td>{{ employee.position_name }}</td>
          <td>{{ employee.department_name }}</td>
          <td>{{ employee.organization_name }}</td>
          <td>
            <a v-if="employee.file_path" :href="employee.file_path" target="_blank">Download</a>
            <span v-else>No file available</span>
          </td>
          <td>
  <!-- Кнопка DELETE для каждого сотрудника -->
  <button @click="deleteEmployee(employee.employee_id)" class="delete-button" :title="'Delete ' + employee.first_name + ' ' + employee.last_name">
    Удалить
  </button>
</td>
        </tr>
      </tbody>
    </table>

    <!-- Сообщения о состоянии -->
    <div v-else-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="no-data">No employees found.</div>

    <!-- Кнопка для открытия формы добавления сотрудника -->
    <button @click="showAddEmployeeForm = !showAddEmployeeForm" class="add-button">
      Добавить
    </button>

    <!-- Форма добавления нового сотрудника -->
    <div v-if="showAddEmployeeForm" class="add-form">
      <h3>Add New Employee</h3>
      <form @submit.prevent="addEmployee">
        <input v-model="newEmployee.first_name" type="text" placeholder="First Name" required />
        <input v-model="newEmployee.last_name" type="text" placeholder="Last Name" required />
        <input v-model="newEmployee.middle_name" type="text" placeholder="Middle Name" />
        <input v-model="newEmployee.date_of_birth" type="date" placeholder="Date of Birth" required />
        <input v-model="newEmployee.passport_details" type="text" placeholder="Passport Details" />
        <input v-model="newEmployee.passport_issue_date" type="date" placeholder="Passport Issue Date" />
        <input v-model="newEmployee.address" type="text" placeholder="Address" />
        <input v-model="newEmployee.salary" type="number" placeholder="Salary" required />
        <input v-model="newEmployee.position_name" type="text" placeholder="Position" />
        <input v-model="newEmployee.department_name" type="text" placeholder="Department" />
        <input v-model="newEmployee.organization_name" type="text" placeholder="Organization" />
        <input type="file" @change="handleFileChange" />
        <button type="submit">Add Employee</button>
      </form>
    </div>
  </div>
</template>

<script>
// Импортируем API клиент
import apiClient from "../shared/api/instance";

export default {
  name: "EmployeeTable",
  data() {
    return {
      employees: [], // Массив сотрудников
      loading: true, // Статус загрузки
      error: null, // Ошибка, если возникнет
      showAddEmployeeForm: false, // Флаг отображения формы добавления сотрудника
      newEmployee: { // Данные для нового сотрудника
        first_name: '',
        last_name: '',
        middle_name: '',
        date_of_birth: '',
        passport_details: '',
        passport_issue_date: '',
        address: '',
        salary: '',
        position_name: '',
        department_name: '',
        organization_name: '',
        file: null,
      },
    };
  },
  methods: {
    // Функция для получения данных сотрудников
    async fetchEmployees() {
      try {
        const response = await apiClient.getAllEmployees(); // Получаем данные о сотрудниках
        this.employees = response.data; // Сохраняем данные
      } catch (err) {
        this.error = "Failed to fetch employees. Please try again later."; // Сообщение об ошибке
        console.error("Fetch error:", err); // Лог ошибки
      } finally {
        this.loading = false; // Завершаем процесс загрузки
      }
    },

    // Метод для форматирования даты
    formatDate(dateString) {
      if (dateString) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
      }
      return '';
    },

    // Обработчик для выбора файла
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.newEmployee.file = file; // Сохраняем выбранный файл
      }
    },

    // Метод для добавления нового сотрудника
    async addEmployee() {
      const formData = new FormData();
      formData.append("first_name", this.newEmployee.first_name);
      formData.append("last_name", this.newEmployee.last_name);
      formData.append("middle_name", this.newEmployee.middle_name);
      formData.append("date_of_birth", this.newEmployee.date_of_birth);
      formData.append("passport_details", this.newEmployee.passport_details);
      formData.append("passport_issue_date", this.newEmployee.passport_issue_date);
      formData.append("address", this.newEmployee.address);
      formData.append("salary", this.newEmployee.salary);
      formData.append("position_name", this.newEmployee.position_name);
      formData.append("department_name", this.newEmployee.department_name);
      formData.append("organization_name", this.newEmployee.organization_name);
      
      if (this.newEmployee.file) {
        formData.append("file", this.newEmployee.file);  // Добавляем файл
      }

      try {
        const response = await apiClient.addEmployee(formData); // Отправляем FormData на сервер
        this.employees.push(response.data); // Добавляем нового сотрудника в таблицу
        this.showAddEmployeeForm = false; // Закрываем форму
        this.newEmployee = {}; // Очищаем данные формы
      } catch (err) {
        this.error = "Failed to add employee. Please try again later."; // Сообщение об ошибке
        console.error("Add employee error:", err); // Лог ошибки
      }
    },

    // Метод для удаления сотрудника
    async deleteEmployee(employeeId) {
  try {
    console.log("Attempting to delete employee with ID:", employeeId); // Логирование ID для отладки
    const response = await apiClient.softDeleteEmployee(employeeId); // Используем правильный метод API-клиента

    console.log("Delete response:", response); // Логируем ответ от сервера

    if (response.status === 200) {
      // Удаляем сотрудника из таблицы
      this.employees = this.employees.filter(employee => employee.employee_id !== employeeId);
      alert("Employee has been deleted.");
    } else {
      alert("Error deleting employee.");
    }
  } catch (err) {
    this.error = "Failed to delete employee. Please try again later.";
    console.error("Delete employee error:", err);
  }
},
  },
  mounted() {
    this.fetchEmployees(); // Загружаем сотрудников при монтировании компонента
  },
};
</script>

<style scoped>
.employee-table {
  margin: 20px auto;
  max-width: 1200px;
  text-align: center;
  padding-bottom: 80px;
}

.title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.table th {
  background-color: #f4f4f4;
  text-align: center;
}

.table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.table tr:hover {
  background-color: #f1f1f1;
}

.loading {
  color: #007bff;
  font-size: 18px;
}

.error {
  color: red;
  font-size: 18px;
}

.no-data {
  color: #888;
  font-size: 18px;
}

.add-button, .delete-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 10px;
}

.add-button:hover, .delete-button:hover {
  background-color: #218838;
}

.add-form {
  margin-top: 20px;
  text-align: left;
  display: block;
  max-width: 500px;
  margin: 0 auto;
}

.add-form input {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-form button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.add-form button:hover {
  background-color: #0056b3;
}

.delete-button {
  background-color: #dc3545; /* Красный цвет для кнопки DELETE */
}

.delete-button:hover {
  background-color: #c82333; /* Темнее при наведении */
}
</style>
