require('dotenv').config();
const express = require('express');
const app = express()
const userRouter = require('./routes/user')
const cors = require('cors');

app.use(cors({
    origin: "*"
}));
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', error => console.log(error))
db.once('open', () => console.log('Connected to DB'))

app.use(express.json())
app.use('/', userRouter)
app.listen(4000)