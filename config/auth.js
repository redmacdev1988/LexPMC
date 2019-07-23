
module.exports = {
    ensureAuthenticated: function(req, res, next) {
        console.log(`auth.js -- ensureAuthenticated --`);
        console.log(req.isAuthenticated());

        if (req.isAuthenticated()) {
            console.log(' ----> to next ');
            return next();
        } else {
            console.log('auth.js - not authenticated!');
            req.flash('error_msg', 'Please Log in to view this resource');
            res.redirect('/users/login');
        }
    }
}

console.log(`config/auth.js - ensureAuthenticated created for /dashboard check`);
