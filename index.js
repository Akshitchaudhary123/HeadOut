const express = require('express');
const app = express();
const cors = require('cors');
const { dbConnection } = require('./db/dbonnection.js');
const { routes } = require('./routes.js');
require('dotenv').config();
const path = require('path');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname,'public')));

// Log loaded routes
// console.log('Loaded routes:', routes);

// Apply routes
routes.forEach((route) => {
    app.use(route.path, route.handler);
});

// Set the port
const Port = process.env.PORT || 5000;

// Start the server
app.listen(Port, async () => {
    try {
        await dbConnection();
        console.log(`Server is listening on port ${Port}..`);
    } catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1); // Exit process with failure
    }
});
