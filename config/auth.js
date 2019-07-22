
module.exports = {
    ensureAuthenticated: function(req, res, next) {
        console.log(`auth.js -- ensureAuthenticated --`);
        if (req.isAuthenticated()) {
            return next();
        }

        req.flash('error_msg', 'Please Log in to view this resource');
        res.redirect('/users/login');
    }
}

console.log(`config/auth.js - ensureAuthenticated created for /dashboard check`);
