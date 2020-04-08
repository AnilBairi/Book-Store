const LocalStrategy = require('passport-local').Strategy;
const user = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = passport => {
    // Local Strategy
    passport.use(new LocalStrategy((username, password, done) => {
        //Mactch Username
        let query = { username: username };
        user.findOne(query, (err, user) => {
            if (err) throw err;
            if (!user) {
                console.log('No user found!');
                return done(null, false, { message: 'No user found!' });
            }
            //Match Password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    console.log('Authentication Successful!');
                    return done(null, user);
                } else {
                    console.log('Password incorrect!');
                    return done(null, false, { message: 'Password incorrect!' });
                }
            });
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        user.findById(id, (err, user) => {
            done(err, user);
        });
    });
}