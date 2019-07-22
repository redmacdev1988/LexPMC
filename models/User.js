const mongoose = require('mongoose');
console.log(`∆ models/User.js - mongoose required`);

// create schema
const UserSchema = new mongoose.Schema({
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
    undergraduateCheckBox: {
        type: Boolean,
        default: false
    },
    undergraduateInstitution: {
        type: String,
        default: ""
    },
    undergradDegreeReceivedCheckBox: {
        type: Boolean,
        default: false
    },
    undergraduateGradDate: {
        type: String,
        default: ""
    },
    legalSearchKnowHow: {
        type: Boolean,
        default: false
    },
    skills: {
        type: String,
        default: ""
    },
    approval: {
        type: Boolean,
        default: false,
    },

    isAttorney: {
        type: Boolean,
        default: false
    },

    isFreelancer: {
        type: Boolean,
        default: false,
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;