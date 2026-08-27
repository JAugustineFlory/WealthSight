const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const knex = require('knex')(require('../knexfile').development);

//Signup
//using async because both hashing the password and querying the database return promises
router.post('/signup', async (req,res) => {
    try {
        //defines req.body and sets it to store user info
        const { username, email, password } = req.body;
        //use bcrypt to hash password | 10 rounds
        const password_hash = await bcrypt.hash(password, 10);
        //destructures returned array to grab first result
        const [newUser] = await knex('users')
            .insert({ username, email, password_hash })
            //returns id, username, and email
            .returning(['id', 'username', 'email']);

        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: `Error: ${err}` });
    }
});

//Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        //first() returns single  matching row directly or undefined
        const user = await knex('users').where({ email }).first();
        //If email doesn't exist return 401 Unauthorized | counter for user enumeration vulnerability
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        //One-way hash — extracts the salt from the stored hash, re-hashes the entered password the same way, compares results
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }


        res.cookie('userId', user.id, {
            httpOnly: true, //prevents JS running in the browser from reading this cookie
            maxAge: 24 * 60 * 60 * 1000, //user stays logged in for 24hrs
        });

        res.status(200).json({ id: user.id, username: user.username, email: user.email });
    
    } catch (err) {
        res.status(400).json({ message: `Error: ${err}` });
    } 
});


module.exports = router;