


const express = require("express");

const bodyParser = require("body-parser");
const mongoose = require("mongoose");

var source = require("rfr");

const api = source("./src/api/api");

mongoose.connect("mongodb://localhost/psc");


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', api);

app.listen(process.env.PORT || 8080, () => {
    console.log(`Server started, listening on port ${process.env.PORT || 8080}.`);
});

function isDev() {
    return process.env.NODE_ENV === 'development';
}

module.exports = app;
