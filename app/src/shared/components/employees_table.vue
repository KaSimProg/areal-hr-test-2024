<!-- src/components/EmployeeList.vue -->
<template>
    <div class="employee-list">
      <h1>Сотрудники</h1>
      <div v-if="loading" class="loading">Загрузка...</div>
      <div v-if="error" class="error">{{ error }}</div>
      <table v-if="employees.length">
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Должность</th>
            <th>Отдел</th>
            <th>Организация</th>
            <th>Файл</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employees" :key="employee.employee_id">
            <td>{{ employee.employee_id }}</td>
            <td>{{ employee.first_name }} {{ employee.last_name }}</td>
            <td>{{ employee.position_name }}</td>
            <td>{{ employee.department_name }}</td>
            <td>{{ employee.organization_name }}</td>
            <td>
              <a :href="employee.file_path" target="_blank">Посмотреть файл</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        employees: [],
        loading: true,
        error: null,
      };
    },
    created() {
      this.fetchEmployees();
    },
    methods: {
      async fetchEmployees() {
        try {
          const response = await axios.get('http://localhost:3000/api/employees');
          this.employees = response.data;
        } catch (error) {
          this.error = 'Не удалось загрузить данные сотрудников';
        } finally {
          this.loading = false;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .employee-list {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    text-align: center;
    color: #333;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: #f4f4f4;
  }
  
  tr:hover {
    background-color: #f1f1f1;
  }
  
  .loading, .error {
    text-align: center;
    font-size: 1.2em;
    color: #333;
  }
  
  a {
    color: #007bff;
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
  </style>