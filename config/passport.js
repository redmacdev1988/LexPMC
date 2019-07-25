const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User Model

const Freelancer = require('../models/Freelancer');
const Attorney = require('../models/Attorney');
const Admin = require('../models/Admin');

const USER_TYPE_FREELANCER = "freelancer";
const USER_TYPE_ATTORNEY = "attorney";
const USER_TYPE_ADMIN = "admin";

// passport object gets passed in from app.js
module.exports = function(passport) {
    
    passport.use('local-freelance',
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            Freelancer.findOne({ email })
            .then(user => { 
                if (!user) { return done(null, false, { message: 'That email is not registered'} );} 
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'password incorrect'});
                    }
                });
            }).catch(err => console.log(err))
        })
    );

    passport.use('local-attorney',
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            Attorney.findOne({ email })
            .then(user => { 
                if (!user) { return done(null, false, { message: 'That email is not registered'} ); } 
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'password incorrect'});
                    }
                });
            }).catch(err => console.log(err))
        })
    );


    passport.use('local-admin',
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            Admin.findOne({ email })
            .then(user => { 
                if (!user) { return done(null, false, { message: 'That email is not registered'} );} 
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'password incorrect'});
                    }
                });
            }).catch(err => console.log(err))
        })
    );


    // The user id (you provide as the second argument of the done function) is saved in the session 
    // and is later used to retrieve the whole object via the deserializeUser function.

    // serializeUser determines which data of the user object should be stored in the session. 
    // The result of the serializeUser method is attached to the session as req.session.passport.user = {}. 
    // Here for instance, it would be (as we provide the user id as the key) req.session.passport.user = {id: 'rtsao@uci.edu'}

    passport.serializeUser((user, done) => {
        done(null, {
            id: user._id,
            type: user.userType,
        });
    });

    // the id here is the user.id you passed into done in serializeUser.
    // you then use your Schema to find that id.

    // The first argument of deserializeUser corresponds to the key of the user object 
    // that was given to the done function in serializeUser.

    // So your whole object is retrieved with help of that key. That key here is the user id 
    // (key can be any key of the user object i.e. name,email etc).
    passport.deserializeUser((sessionObj, userInfo, done) => {
        if (userInfo.type === USER_TYPE_ATTORNEY) {
            Attorney.findById(userInfo.id, function(err, user) {
                done(err, user);
            });
        } else if (userInfo.type === USER_TYPE_FREELANCER) {
            Freelancer.findById(userInfo.id, function(err, user) {
                done(err, user);
            });
        } else if (userInfo.type === USER_TYPE_ADMIN) {
            Admin.findById(userInfo.id, function(err, user) {
                done(err, user);
            });
        }
    });
}

console.log('config/passport.js - Passport LocalStrategy function created and exported');