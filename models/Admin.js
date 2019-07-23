const mongoose = require('mongoose');
const USER_TYPE_ADMIN = "admin";

// create schema
const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    telephone: {
        type: String,
        default: ""
    },
    date: {
        type: Date,
        default: Date.now
    },
    userType: {
        type: String,
        default: USER_TYPE_ADMIN,
    },
});

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;