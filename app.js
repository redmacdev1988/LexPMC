const express = require('express');
const app = express();

//Passport
const passport = require('passport');
require('./config/passport')(passport);

//Flash
const flash = require('connect-flash');
app.use(flash());

//Mongoose DB Config
const db = require('./config/keys').MongoURI;
const mongoose = require('mongoose');
mongoose.connect(db, { useNewUrlParser: true })
.then(() => { console.log(`√ mongoose db connected to ${db}`);})
.catch(error => console.log(error));

//EJS
const expressLayouts = require('express-ejs-layouts')
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express Session
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// declare public folder.
// Note: always be above passport
app.use('/public', express.static('public'));

app.use(passport.initialize());
app.use(passport.session());

// Global  Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error  = req.flash('error');
    next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
console.log(`√ route folder files declared for / and /users`);



const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server started on ${PORT}`));