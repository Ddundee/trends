require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const vehicleRoutes = require('./routes/vehicles.js')
const chatBotRoutes = require('./routes/chatBot.js');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: 'http://localhost:3001', // Your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type'], // Allowed headers
}));

app.use(express.json()); // ensures that any incoming JSON request body is parsed and available on req.body

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

app.use('/api/chatBot', chatBotRoutes);
app.use('/api/vehicles', vehicleRoutes);

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = path.join(__dirname, req.file.path);
    const workbook = xlsx.readFile(filePath);

    const sheetName = workbook.SheetNames[0]; // assuming your data is in the first sheet and it starts at row 1

    const sheet = workbook.Sheets[sheetName];

    const jsonData = xlsx.utils.sheet_to_json(sheet);  // Parse the data from the sheet to JSON

    const filteredData = jsonData.map((row) => ({
        year: row['Model Year'],
        manufacturer: row['Mfr Name'],
        model: row['Carline'],
        transmission: row['Transmission'],
        cylinders: row['# Cyl'],
        cityFE: row['City FE (Guide) - Conventional Fuel'],
        highwayFE: row['Hwy FE (Guide) - Conventional Fuel'],
        combinedFE: row['Comb FE (Guide) - Conventional Fuel']
    }));

    Vehicle.insertMany(filteredData)
        .then(() => {
            res.send('Data has been successfully uploaded and stored.');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error inserting data into MongoDB.');
        });
});

// Define the filename to store conversation history
const historyFilename = 'conversation_history.json';

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Connected to database and server running on port ${process.env.PORT}.`);
        });
    })
    .catch((error) => {
        console.log(error);
    });