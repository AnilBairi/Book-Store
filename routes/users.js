const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');

//Bring user Model
const User = require('../models/user');

// Show Register Form
router.get('/register', (req, res) => {
    res.render('register');
});

//Submit Registration
router.post('/register', (req, res) => {
    let user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.username = req.body.username;
    user.password = req.body.password;

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            user.save(err => {
                if (err) {
                    console.log(err);
                } else {
                    // req.flash('success', 'User Registered');
                    console.log('User Registered Successfully!')
                    res.redirect('/users/login');
                }
            });
        })
    });


});

//Loign Form
router.get('/login', (req, res) => {
    res.render('login');
});

//Login Process
router.post('/login', (req, res, next) => {
    console.log(`Authenticating user ${req.body.username}`);
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//Login Process
router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

module.exports = router;