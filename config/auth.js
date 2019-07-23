
module.exports = {
    ensureAuthenticated: function(req, res, next) {
        console.log(req.isAuthenticated());

        if (req.isAuthenticated()) {
            return next();
        } else {
            req.flash('error_msg', 'Please Log in to view this resource');
            res.redirect('/users/login');
        }
    }
}

console.log(`config/auth.js - ensureAuthenticated created for /dashboard check`);
