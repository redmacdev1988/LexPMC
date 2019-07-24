const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const Freelancer = require('../models/Freelancer');
const Attorney = require('../models/Attorney');
const Admin = require('../models/Admin');

const passport = require('passport');

const USER_TYPE_FREELANCER = "freelancer";
const USER_TYPE_ATTORNEY = "attorney";
const USER_TYPE_ADMIN = "admin";

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

    let userType = req.body.userType;

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
            userType
        }); // re-render form in error
    } else {
        console.log('users.js - validation passed');
        let promise;
        if (userType === USER_TYPE_FREELANCER) {
            promise = Freelancer.findOne({email});
        } else if (userType === USER_TYPE_ATTORNEY) {
            promise = Attorney.findOne({email});
        } else if (userType === USER_TYPE_ADMIN) {
            promise = Admin.findOne({email});
        }

        promise.then(user => {
            if (user) {
                errors.push({ msg: 'Email is already registered'});
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2,
                    userType
                }); // re-render form in error
            } else {
                // create instance

                let newUser;
                
                if (userType === USER_TYPE_FREELANCER) {
                    newUser = new Freelancer({
                        name,
                        email,
                        password,
                        userType
                    });
                } else if (userType === USER_TYPE_ATTORNEY) {
                    newUser = new Attorney({
                        name,
                        email,
                        password,
                        userType
                    });
                } else if (userType === USER_TYPE_ADMIN) {
                    newUser = new Admin({
                        name,
                        email,
                        password,
                        userType
                    });
                }
            
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
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
    console.log('users.js - /login -------');

    if (req.body.userType == USER_TYPE_FREELANCER) {
        
        passport.authenticate('local-freelance', {
            successRedirect: '/dashboard',
            failureRedirect: '/users/login',
            failureFlash: true
        })(req, res, next);
    } else if (req.body.userType == USER_TYPE_ATTORNEY) {

        passport.authenticate('local-attorney', {
            successRedirect: '/dashboard',
            failureRedirect: '/users/login',
            failureFlash: true
        })(req, res, next);
    } else {
        passport.authenticate('local-admin', {
            successRedirect: '/dashboard',
            failureRedirect: '/users/login',
            failureFlash: true
        })(req, res, next);
    }
});


// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;