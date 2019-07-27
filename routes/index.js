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
        } else { res.send('sorry, only attorneys allowed'); }
    } else { res.send('please log in or register'); }
});

router.get('/admin', (req, res) => {
    console.log(' you reached GET on /admin');
});

router.post('/admin', (req, res) => {
    console.log(' you reached POST on /admin');
    var promises = [];
    let checkedArr = [];
    let allEmails = req.body.userEmail;

    Object.keys(req.body).forEach(function(key,index) {
        if (key !== 'userEmail') {
            let data = key.split('_');
            let email = data[0];
            let userType = data[1];
            checkedArr.push(email+'_'+userType);
            if (userType === USER_TYPE_FREELANCER) {
                promises.push( newPromise(Freelancer, email, found => { found['approval'] = true; }) );
            } else if (userType === USER_TYPE_ATTORNEY) {
                promises.push( newPromise(Attorney, email, found => { found['approval'] = true; }) );
            }
        } else { console.log('keep interating the keys'); }
    });

    let setToFalseArr = allEmails.diff(checkedArr);

    setToFalseArr.forEach(function(key, index) {
        let data = key.split('_');
        let email = data[0];
        let type = data[1];
        if (type === USER_TYPE_FREELANCER) {
            promises.push( newPromise(Freelancer, email, found => { found['approval'] = false; }) );
        } else if (type === USER_TYPE_ATTORNEY) { 
            promises.push( newPromise(Attorney, email, found => { found['approval'] = false; }) );
        }
    });

    Promise.all(promises).then((values) => {
        console.log(' ------------- PROMISES DONE ------- √ ');
        populateAdminPageWithFreelancersAndAttorneys(users => {
            res.render('admin', { users, _message: 'saved'}); 
        });
    });
});


router.get('/dashboard', ensureAuthenticated, (req, res) => {
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
        populateAdminPageWithFreelancersAndAttorneys(users => {
            res.render('admin', {users, _message: ''});
        });
    } else { res.send('uh oh, neither attorney or freelancer checked'); }
});

router.post("/dashboard", (req, res) => {
    console.log(`youve reached dashbaord`);
    const { userType } = req.body;

    if (userType == USER_TYPE_FREELANCER) {
        gSchemaDo.setData(Freelancer, req.body, req.user, res);
    } else if (userType == USER_TYPE_ATTORNEY) {
        console.log('-- setting data for attorney ---');
        gSchemaDo.setData(Attorney, req.body, req.user, res);
    } else if (userType == USER_TYPE_ADMIN) {
        gSchemaDo.setData(Admin, req.body, req.user, res);
    } 
});


function populateAdminPageWithFreelancersAndAttorneys(callback) {
    let promises = [];
    promises.push(
        Freelancer.find({}).then((freelancers, error) => {return freelancers;})
    )
    promises.push(
        Attorney.find({}).then((attornies, error) => {return attornies;})
    );
    Promise.all(promises)
    .then((values) => { callback(flatten(values)); });
}

function newPromise(Schema, email, callback) {
    return new Promise(resolve => {
        Schema.findOne({ email }).then ((found, error) => {
            if (found && !error) {
                callback(found);
                found.save(err => { if (!err) resolve(true); });
            }
        }).catch(err => { res.status(400).send('routes/index.js - Unable to save to database: ' + err); })
    });
}

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
  }




let gSchemaDo = (function SetUserData() {

    function _setFreelancerObject(found, bodyData, bodyUser, res) {
        found['undergraduateCheckBox'] = (bodyData.undergraduateCheckBox === 'on') ? true : false;
        found['undergraduateInstitution'] = bodyData.undergraduateInstitution;
        found['undergradDegreeReceivedCheckBox'] = (bodyData.undergradDegreeReceivedCheckBox === 'on') ? true: false;
        found['undergraduateGradDate'] = bodyData.undergraduateGradDate;
    
        if (bodyData.undergraduateCheckBox !== 'on') {
            found['undergradDegreeReceivedCheckBox'] = false;
            found['undergraduateInstitution'] = "";
            found['undergraduateGradDate'] = "";
        }
        if (bodyData.undergradDegreeReceivedCheckBox !== 'on') {
            found['undergraduateGradDate'] = "";
        }
        found['legalSearchKnowHow'] = (bodyData.legalSearchKnowHow === '1') ? true : false;
        found['skills'] = bodyData.skills;
        found['telephone'] = bodyData.telephone;
    
        found.save(err => {
            if (err) {console.log(error);} 
            else {
                res.render('dashboard', {
                    name: bodyData.name,
                    email: bodyData.email,
                    approval: found['approval'],
                    skills: found['skills'],
                    telephone: found['telephone'],
                    undergraduateCheckBox: found['undergraduateCheckBox'],
                    undergraduateInstitution: found['undergraduateInstitution'],
                    undergradDegreeReceivedCheckBox: found['undergradDegreeReceivedCheckBox'],
                    undergraduateGradDate: found['undergraduateGradDate'],
                    legalSearchKnowHow: found['legalSearchKnowHow'],
                    userType: bodyUser.userType,
                    _message: 'saved',
                });
            }
        });
    }
    
    function _setAttorneyObject(found, bodyData, bodyUser, res) {
        found['telephone'] = bodyData.telephone;
        found.save(err => {
            if (err) { console.log(error); } 
            else {
                res.render('dashboard', {
                    name: bodyData.name,
                    email: bodyData.email,
                    approval: found['approval'],
                    telephone: found['telephone'],
                    userType: bodyUser.userType,
                    _message: 'saved',
                });
            }
        });
    }
    
    
    function _setAdminObject(found, bodyData, bodyUser, res) {
        found['telephone'] = req.body.telephone;
        found.save(err => {
            if (err) { console.log(error); } 
            else {
                res.render('dashboard', {
                    name: bodyData.name,
                    email: bodyData.email,
                    approval: found['approval'],
                    telephone: found['telephone'],
                    userType: bodyUser.userType,
                    _message: 'saved',
                });
            }
        });
    }

    function findOneAndSetData(Schema, bodyData, bodyUser, res) {
        Schema.findOne({ email: bodyData.email }).then( (found, error) => {
            if (found) {
                switch (found['userType']) {
                    case USER_TYPE_FREELANCER: 
                        _setFreelancerObject(found, bodyData, bodyUser, res);
                        break;
                    case USER_TYPE_ATTORNEY:
                        _setAttorneyObject(found, bodyData, bodyUser, res);
                        break;
                    case USER_TYPE_ADMIN:
                        _setAdminObject(found, bodyData, bodyUser, res);
                        break;
                }
            } 
        });
    }
    return {
        setData: findOneAndSetData,
    };
})(); 

module.exports = router;