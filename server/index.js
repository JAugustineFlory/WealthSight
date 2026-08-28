require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

const PORT = process.env.PORT || 3000;

const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const billsRouter = require('./routes/bills');
const incomeRouter = require('./routes/income');
const budgetsRouter = require('./routes/budgets');
const categoriesRouter = require('./routes/categories');

const checkAuth = require('./middleware/checkAuth');

app.use(cors());//Cross Origin Resource Sharing | Tells the browser we trust our sources
app.use(express.json());//Parses JSON into usable JS
app.use(cookieParser());
app.use('/users', usersRouter);
app.use('/cards', cardsRouter);
app.use('/bills', billsRouter);
app.use('/income', incomeRouter);
app.use('/budgets', budgetsRouter);
app.use('/categories', categoriesRouter);


//Confirm server is online
app.get('/', (req, res) => {
    res.send('WealthSight API is ONLINE!')
})

//Listen/keep server running and waiting for requests
app.listen(PORT, () => {
    console.log(`WealthSight API awaiting command on port ${PORT}`);
});

module.exports = app;