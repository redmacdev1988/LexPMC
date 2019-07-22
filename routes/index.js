const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const User = require('../models/User');

// Welcome Page
router.get('/', (req, res) => {
    //res.send('Welcome'); 
    console.log(`≈ routes/index.js - GET on / `);

    User.find({ approval: true})
    .then((arrOfData, error) => {
        return res.render('welcome', {
            users: arrOfData
        });
    });
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
            User.findOne({ email })
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
        User.find({})
        .then((arrOfData, error) => {
            return res.render('admin', {
                users: arrOfData
            });
        });
    });
});

// dashboard Page
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    console.log(`≈ routes/index.js - GET on  /dashboard `);

    console.log(req.user.isFreelancer);
    console.log(req.user.isAttorney);
    console.log(req.user.name);
    if (req.user.name !== 'admin' && req.user.email !== 'admin@gmail.com') {
         if (req.user.isFreelancer) {
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
                isFreelancer: req.user.isFreelancer,
                isAttorney: req.user.isAttorney,
                _message: '',
            });
        } else if (req.user.isAttorney) {
            return res.render('dashboard', {
                name: req.user.name,
                email: req.user.email,
                approval: req.user.approval,
                telephone: req.user.telephone,
                isFreelancer: req.user.isFreelancer,
                isAttorney: req.user.isAttorney,
                _message: '',
            });
        }
    } else {
        User.find({})
        .then((arrOfData, error) => {
            return res.render('admin', {
                users: arrOfData
            });
        });
    }
});


router.post("/dashboard", (req, res) => {
    console.log(`≈ routes/index.js - POST on  /dashboard `);

    console.log(`trying to find ${req.body.email}`);
    User.findOne({ email: req.body.email })
    .then( (found,error) => {

       if (found) {
            console.log(found);
            if (found['isFreelancer']) {
                console.log('lets save this freelancer!!!');
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
                            isFreelancer: req.user.isFreelancer,
                            isAttorney: req.user.isAttorney,
                            _message: 'saved',
                        });
                    }
                });
            } else if (found['isAttorney']) {
                console.log('letssave this attorney');
                found['telephone'] = req.body.telephone;

                found.save(err => {
                    if (err) {
                        console.log(error);
                    } else {
                        return res.render('dashboard', {
                            name: req.body.name,
                            email: req.body.email,
                            approval: req.body.approval,
                            telephone: found['telephone'],
                            isFreelancer: req.user.isFreelancer,
                            isAttorney: req.user.isAttorney,
                            _message: 'saved',
                        });
                    }
                });
            }
       } else {
           console.log('not found');
       }
    })
    .catch(err => {
        res.status(400).send('routes/index.js - Unable to save to database: ' + err);
    });
});

module.exports = router;