const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const Freelancer = require('../models/Freelancer');
const Attorney = require('../models/Attorney');

var moment = require('moment');

const USER_TYPE_FREELANCER = "freelancer";
const USER_TYPE_ATTORNEY = "attorney";
const USER_TYPE_ADMIN = "admin";

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

    console.log('--req.body--');
    console.log(req.body);

    let typeArr = req.body.userType;
    
    Object.keys(req.body).forEach(function(key,index) {

        console.log('-- key --');
        console.log(key);
        
        if (key !== 'userType') {

            let data = key.split('_');
            let email = data[0];
            let bApprove = data[1];
            let userType = typeArr[index-1];

            console.log(`[${index-1}] ---> ${email}, ${bApprove}, ${userType}`);

            
            if (userType === USER_TYPE_FREELANCER) {
                promises.push(
                    Freelancer.findOne({ email })
                    .then ((found, error) => {
                        if (found && !error) {
                            found['approval'] = (bApprove === 'approve') ? true : false;
                            found.save(err => { 
                                if (!err) {
                                    return true;
                                } else {
                                    console.log(err);
                                    return false;
                                }
                            });
                            return found;
                        }
                    }).catch(err => { res.status(400).send('routes/index.js - Unable to save to database: ' + err); })
                );
            } else if (userType === USER_TYPE_ATTORNEY) {
                promises.push(
                    Attorney.findOne({ email })
                    .then ((found, error) => {
                        if (found && !error) {
                            console.log(`found: ${email}`);
                            found['approval'] = (bApprove === 'approve') ? true : false;
                            found.save(err => { 
                                if (!err) {
                                    return true;
                                } else {
                                    console.log(err);
                                    return false;
                                }
                            });
                            return found;
                        }
                    }).catch(err => { res.status(400).send('routes/index.js - Unable to save to database: ' + err); })
                );
            }
        } else { console.log('keep interating the keys'); }
    });

    console.log(`..by way of Promise ALL: there are ${promises.length} promises to be processed`);


    Promise.all(promises).then((values) => {

        let promises2 = [];
        promises2.push(
            Freelancer.find({}).then((freelancers, error) => {return freelancers;})
        )
        promises2.push(
            Attorney.find({}).then((attornies, error) => {return attornies;})
        );
        Promise.all(promises2)
        .then((values) => {
            return res.render('admin', {
                users: flatten(values),
                _message: 'saved',
            }); 
        });
    });
});


function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
  }


// dashboard Page
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    console.log(`≈ routes/index.js - GET on  /dashboard `);
    
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
    }  else if (req.user.userType === USER_TYPE_ADMIN) {
        let promises = [];
        promises.push(
            Freelancer.find({}).then((freelancers, error) => {return freelancers;})
        );
        promises.push(
            Attorney.find({}).then((attornies, error) => { return attornies;})
        )
        Promise.all(promises).then((values) => {
            return res.render('admin', {
                users: flatten(values),
                _message: '',
            });
        })
        .catch(error=>console.log(error));
    } else {
        return res.send('uh oh, neither attorney or freelancer checked');
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
    } else if (userType == USER_TYPE_ADMIN) {
        promise = Admin.findOne({ email: req.body.email });
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
            } else if (found['userType'] === USER_TYPE_ADMIN) {
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