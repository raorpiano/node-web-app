'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const YEAR = process.env.YEAR || 2019;

// App
const app = express();
app.get('/', (req, res) => {
  res.send(`This app runs on container. Last run on ${YEAR}`);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
