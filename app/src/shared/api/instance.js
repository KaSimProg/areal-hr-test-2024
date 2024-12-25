// src/services/apiClient.js

import axios from 'axios';

// Создаем экземпляр axios с базовым URL
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // Замените на ваш API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Экспортируем методы работы с API
export default {
  // Получить всех сотрудников
  getAllEmployees() {
    return apiClient.get('/employees');
  },

  // Добавить нового сотрудника
  addEmployee(employeeData) {
    return apiClient.post('/employees', employeeData);
  },

  // Мягкое удаление сотрудника
  softDeleteEmployee(employeeId) {
    return apiClient.put('/employees/delete', { id: employeeId }); // Указываем данные для удаления
  },
};

