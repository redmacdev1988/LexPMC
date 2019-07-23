const mongoose = require('mongoose');

const USER_TYPE_FREELANCER = "freelancer";

// create schema
const FreelancerSchema = new mongoose.Schema({
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

    userType: {
        type: String,
        default: USER_TYPE_FREELANCER,
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

const Freelancer = mongoose.model('Freelancer', FreelancerSchema);
module.exports = Freelancer;