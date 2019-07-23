const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const Freelancer = require('../models/Freelancer');
const Attorney = require('../models/Attorney');

var moment = require('moment');

const USER_TYPE_FREELANCER = "freelancer";
const USER_TYPE_ATTORNEY = "attorney";

// Welcome Page
router.get('/', (req, res) => {
    //res.send('Welcome'); 
    console.log(`≈ routes/index.js - GET on / `);
    return res.render('welcome');
});

router.get('/listing', (req, res) => {
    console.log(' - Get on listing /');
    if (req.user) {
        if(req.user.userType === USER_TYPE_ATTORNEY) {
            Freelancer.find({approval: true, userType: USER_TYPE_FREELANCER})
            .then((freelancers, error) => {
                return res.render('listing', {
                    freelancers,
                    user: req.user,
                    moment
                });
            });
        } else {
            res.send('sorry, only attorneys allowed');
        }
    } else {
        res.send('please log in or register');
    }
    
});

router.get('/admin', (req, res) => {
    console.log(' you reached GET on /admin');
});

router.post('/admin', (req, res) => {
    console.log(' you reached POST on /admin');
    var promises = [];
    Object.keys(req.body).forEach(function(key,index) {
        let data = key.split('_');
        let email = data[0];
        let bApprove = data[1];
        promises.push(
            Freelancer.findOne({ email })
            .then ((found, error) => {
                if (found && !error) {
                    found['approval'] = (bApprove === 'approve') ? true : false;
                    found.save(err => { if (!err) {} });
                }
            }).catch(err => { res.status(400).send('routes/index.js - Unable to save to database: ' + err); })
        );
    });

    Promise.all(promises)
    .then(() => {
        console.log('all done nikka!... find all Users, then go to admin template');
        Freelancer.find({})
        .then((arrOfData, error) => {
            return res.render('admin', {
                users: arrOfData,
                _message: 'saved',
            });
        });
    });
});

// dashboard Page
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    console.log(`≈ routes/index.js - GET on  /dashboard `);
    if (req.user.name !== 'admin' && req.user.email !== 'rtsao6680@gmail.com') {
         if (req.user.userType === USER_TYPE_FREELANCER) {
            return res.render('dashboard', {
                name: req.user.name,
                email: req.user.email,
                approval: req.user.approval,
                telephone: req.user.telephone,
                skills: req.user.skills,
                undergraduateCheckBox: req.user.undergraduateCheckBox,
                undergraduateInstitution: req.user.undergraduateInstitution,
                undergradDegreeReceivedCheckBox: req.user.undergradDegreeReceivedCheckBox,
                undergraduateGradDate: req.user.undergraduateGradDate,
                legalSearchKnowHow: req.user.legalSearchKnowHow,
                userType: req.user.userType,
                _message: '',
            });
        } else if (req.user.userType === USER_TYPE_ATTORNEY) {
            return res.render('dashboard', {
                name: req.user.name,
                email: req.user.email,
                approval: req.user.approval,
                telephone: req.user.telephone,
                userType: req.user.userType,
                _message: '',
            });
        } else {
            return res.send('uh oh, neither attorney or freelancer checked');
        }
    } else {
        Freelancer.find({})
        .then((arrOfData, error) => {
            return res.render('admin', {
                users: arrOfData,
                _message: '',
            });
        });
    }
});


router.post("/dashboard", (req, res) => {
    console.log(`≈ routes/index.js - POST on  /dashboard `);

    console.log(`trying to find ${req.body.email}`);

    const { userType } = req.body;

    console.log(req.body);



    let promise;

    if (userType == USER_TYPE_FREELANCER) {
        promise = Freelancer.findOne({ email: req.body.email });
    } else if (userType == USER_TYPE_ATTORNEY) {
        promise = Attorney.findOne({ email: req.body.email });
    }

    promise.then( (found,error) => {
    if (found) {
            console.log(found);
            if (found['userType'] === USER_TYPE_FREELANCER) {

                found['undergraduateCheckBox'] = (req.body.undergraduateCheckBox === 'on') ? true : false;
                found['undergraduateInstitution'] = req.body.undergraduateInstitution;
                found['undergradDegreeReceivedCheckBox'] = (req.body.undergradDegreeReceivedCheckBox === 'on') ? true: false;
                found['undergraduateGradDate'] = req.body.undergraduateGradDate;
                if (req.body.undergraduateCheckBox !== 'on') {
                    found['undergradDegreeReceivedCheckBox'] = false;
                    found['undergraduateInstitution'] = "";
                    found['undergraduateGradDate'] = "";
                }
                if (req.body.undergradDegreeReceivedCheckBox !== 'on') {
                    found['undergraduateGradDate'] = "";
                }
                found['legalSearchKnowHow'] = (req.body.legalSearchKnowHow === '1') ? true : false;
                found['skills'] = req.body.skills;
                found['telephone'] = req.body.telephone;
                found.save(err => {
                    if (err) {
                        console.log(error);
                    } else {
                        return res.render('dashboard', {
                            name: req.body.name,
                            email: req.body.email,
                            approval: req.body.approval,
                            skills: found['skills'],
                            telephone: found['telephone'],
                            undergraduateCheckBox: found['undergraduateCheckBox'],
                            undergraduateInstitution: found['undergraduateInstitution'],
                            undergradDegreeReceivedCheckBox: found['undergradDegreeReceivedCheckBox'],
                            undergraduateGradDate: found['undergraduateGradDate'],
                            legalSearchKnowHow: found['legalSearchKnowHow'],
                            userType: req.user.userType,
                            _message: 'saved',
                        });
                    }
                });
            } else if (found['userType'] === USER_TYPE_ATTORNEY) {
                found['telephone'] = req.body.telephone;
                found.save(err => {
                    if (err) { console.log(error); } 
                    else {
                        return res.render('dashboard', {
                            name: req.body.name,
                            email: req.body.email,
                            approval: req.body.approval,
                            telephone: found['telephone'],
                            userType: req.user.userType,
                            _message: 'saved',
                        });
                    }
                });
            }
    } else { console.log('not found'); }
    })
    .catch(err => {
        res.status(400).send('routes/index.js - Unable to save to database: ' + err);
    });
   
});

module.exports = router;