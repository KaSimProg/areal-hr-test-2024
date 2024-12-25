const express = require('express'); 
const userRoutes = require('./routes/routes.js'); 
const cors = require('cors'); 

const app = express();

const enableServer = () => {
    try {
        app.use(cors());  // Разрешаем кросс-доменные запросы
        app.use(express.json());  // Для обработки JSON тела запроса

        // Используем маршруты с префиксом '/api'
        app.use('/api', userRoutes); 

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);  // Используем шаблонную строку с обратными кавычками
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

enableServer();
