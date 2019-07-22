const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const passport = require('passport');
// Login Page
router.get('/login', (req, res) => {
    console.log(`routes/users.js - about to render view/login.ejs`);
    res.render('login'); 
});

// Register Page
router.get('/register', (req, res) => {
    console.log(`routes/users.js - about to render view/register.ejs`);
    res.render('register'); 
});

// Register Handle
router.post('/register', (req, res) => {
    
    const { name, email, password, password2, isAttorney, isFreelancer } = req.body;
    let bFreelancer = (isFreelancer == 'on') ? true: false;
    let bAttorney = (isAttorney == 'on') ? true: false;

    let errors = [];
    if (!email || !name || !password || !password2) { errors.push({msg: 'please fill in all fields'}); }
    if (password !== password2) { errors.push({msg: 'passwerds dont maiyatch'}); } 
    if (password.length < 6) { errors.push({msg: 'passwerds shuld be at least 6 characters'}); }
    
    if (errors.length > 0) {
        console.log(`routes/users.js - about to render view/register.ejs with error[] params`);
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2,
            isAttorney: bAttorney,
            isFreelancer: bFreelancer,
        }); // re-render form in error
    } else {

        console.log('users.js - validation passed');

        User.findOne({ email })
        .then(user => {
            if (user) {
                console.log('user.js - user exists. render error');
                // re-render form and send error
                // because user with this email already exists
                errors.push({ msg: 'Email is already reigstered'});

                console.log(`routes/users.js - about to render view/register.ejs with error[] params`);
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2,
                    isAttorney: bAttorney,
                    isFreelancer: bFreelancer
                }); // re-render form in error
            } else {
                console.log('user.js - user does not exist. lets just add it to the db');
                // encrypt password

                // create instance
                const newUser = new User({
                    name,
                    email,
                    password,
                    isAttorney: bAttorney,
                    isFreelancer: bFreelancer
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        console.log('users.js - set password to hashed');
                        newUser.password = hash;
                        console.log('users.js - save user');
                        console.log(newUser);

                        newUser.save().then(user => {
                            if (user) console.log('users.js - user saved successfully');
                            req.flash('success_msg', 'You are now registered and can log in');
                            res.redirect('/users/login');
                        }).catch(err => console.log(err));
                    })
                });
            }
        });
    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    console.log('users.js - /login ');
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});


// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;