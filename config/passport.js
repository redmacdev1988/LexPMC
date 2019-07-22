const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User Model

const User = require('../models/User');

// passport object gets passed in from app.js

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {

            console.log(`config/pasport.js - LocalStrategy`);

            User.findOne({ email })
            .then(user => {
                
                if (!user) {
                    console.log('config/passport.js - no user available');
                    return done(null, false, { message: 'That email is not registered'} );
                } 

                console.log(`user ${user.name}, ${user.email} exists, lets see if password matches`);
                // Match password 
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        console.log('config/passport.js - passwords matches √ ');
                        return done(null, user);
                    } else {
                        console.log('config/passport.js - passwords DOES NOT match X ');
                        return done(null, false, { message: 'password incorrect'});
                    }
                });

            })
            .catch(err => console.log(err));
        })
    );

    // The user id (you provide as the second argument of the done function) is saved in the session 
    // and is later used to retrieve the whole object via the deserializeUser function.

    // serializeUser determines which data of the user object should be stored in the session. 
    // The result of the serializeUser method is attached to the session as req.session.passport.user = {}. 
    // Here for instance, it would be (as we provide the user id as the key) req.session.passport.user = {id: 'rtsao@uci.edu'}

    passport.serializeUser((user, done) => {
        console.log('config/passport.js --- serialize user --- ');
        done(null, user._id);
    });

    // the id here is the user.id you passed into done in serializeUser.
    // you then use your Schema to find that id.

    // The first argument of deserializeUser corresponds to the key of the user object 
    // that was given to the done function in serializeUser.

    // So your whole object is retrieved with help of that key. That key here is the user id 
    // (key can be any key of the user object i.e. name,email etc).
    passport.deserializeUser((id, done) => {
        console.log('config/passport.js --- deserializeUser --- ');

        // In deserializeUser that key is matched with the in memory array / database or any data resource like so:
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

}

console.log('config/passport.js - Passport LocalStrategy function created and exported');