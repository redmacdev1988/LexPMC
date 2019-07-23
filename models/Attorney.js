const mongoose = require('mongoose');
const USER_TYPE_ATTORNEY = "attorney";

// create schema
const AttorneySchema = new mongoose.Schema({
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
    approval: {
        type: Boolean,
        default: false,
    },

    userType: {
        type: String,
        default: USER_TYPE_ATTORNEY,
    },

});

const Attorney = mongoose.model('Attorney', AttorneySchema);
module.exports = Attorney;