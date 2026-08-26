require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());//Cross Origin Resource Sharing | Tells the browser we trust our sources
app.use(express.json());//Parses JSON into usable JS


//Confirm server is online
app.get('/', (req, res) => {
    res.send('WealthSight API is ONLINE!')
})
//Listen/keep server running and waiting for requests
app.listen(PORT, () => {
    console.log(`WealthSight API awaiting command on port ${PORT}`);
});

module.exports = app;