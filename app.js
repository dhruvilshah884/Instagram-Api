const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const UserRouter = require('./router/userRouter');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/Instagram-Api').then(() => {
    console.log('Database Connected');
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: false } // Set to true if using https
}));

app.use('/', UserRouter);
app.use("/uploads", express.static("uploads"));

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
