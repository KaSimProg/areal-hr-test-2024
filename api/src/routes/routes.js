    const express = require('express');
    const employeController = require('../controllers/employes');

    const router = express.Router();

    // Получить всех сотрудников
    router.get('/employees', employeController.getAllEmployees);

    // Добавить нового сотрудника
    router.post('/employees', employeController.addEmployee);

  // Удалить сотрудника
    router.put('/employees/delete', employeController.softDeleteEmployee); // Используем правильный метод контроллера
    
    module.exports = router;