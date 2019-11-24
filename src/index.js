const express = require('express');
const serialPort = require('serialport');
const cors = require('cors');
const app =   express();
const bodyParser = require('body-parser');

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const functions = require('./controllers/functions');
app.use('/controllers/function', functions);


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server Started on port: `,port));
