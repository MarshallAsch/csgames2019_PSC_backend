import * as dotenv from 'dotenv';
if (isDev()) dotenv.config();

import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import { Api } from './api/api';

import * as mongoose from 'mongoose';


mongoose.connect( "mongodb://heroku_3kl5m29n:83if6895vgrctb90vdplunohor@ds157439.mlab.com:57439/heroku_3kl5m29n");


if (isDev()) {
    console.log('Starting server in dev mode.');
}
else {
    console.log('Starting server in prod mode.');
}

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.locals.mongo = mongoose;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONT_END_ORIGIN || "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

const api = new Api();
app.use('/api', api.getRouter());

if (isDev()) {
    app.use(express.static(path.resolve(__dirname, '../frontend')));
    app.get('/*', (req, res) => res.sendFile(path.resolve(__dirname, '../frontend/index.html')));
}
else {
    app.use(express.static('frontend'));
    app.get('/*', (req, res) => res.sendFile('index.html'));
}


app.listen(process.env.PORT || 8080, () => {
    console.log(`Server started, listening on port ${process.env.PORT || 8080}.`);
});

function isDev() {
    return process.env.NODE_ENV === 'development';
}

export default app;