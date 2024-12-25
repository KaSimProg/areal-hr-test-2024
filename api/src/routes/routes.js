    const express = require('express');
    const employeController = require('../controllers/employes');

    const router = express.Router();

    // Получить всех сотрудников
    router.get('/employees', employeController.getAllEmployees);

    module.exports = router;