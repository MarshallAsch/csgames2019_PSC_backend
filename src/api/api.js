
const mongoose = require("mongoose");

const jwt  = require('jsonwebtoken');

const bcrypt = require("bcrypt");
const uuidv4 = require('uuid/v4');
const source = require("rfr");


const Account = source("./src/models/Accounts");
const Profile = source("./src/models/Profile");
const Job = source("./src/models/JobPosting");

const SECRET = "44a0a45f31cf8122651e28710a43530e";

const express = require("express");
const router = express.Router();


function auth(req, res, next) {

    if(!req.headers.authorization) {
        return res.status(400).json({"message": "missing email"});
    }

    let token = req.headers.authorization;

    //Remove Bearer from string
    token = token.slice(7, token.length);

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({"message": "invalid token"});
        } else {

            Account.findOne({
                email: decoded.email,
            }).then((foundUser) => {

                req.user = foundUser;
                next();
            });
        }
    });
}

router.post("/api/v1/auth/signup", ((req, res) => {

    // check for missing params

    if (!req.body.email) {
        return res.status(400).json({"message": "missing email"});
    }

    if (!req.body.first_name) {
        return res.status(400).json({"message": "missing first name"});
    }

    if (!req.body.last_name) {
        return res.status(400).json({"message": "missing last name"});
    }

    if (!req.body.password) {
        return res.status(400).json({"message": "missing password"});
    }

    if (!req.body.phone_number) {
        return res.status(400).json({"message": "missing password"});
    }

    Account.findOne({
        email: req.body.email,
    }).then(foundUser => {

        if (foundUser) {
            return res.status(500).json({"message": "email already in use"});
        } else {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(req.body.password, salt, function (err, hash) {
                    // Store hash in your password DB.

                    var usr = new Account({
                        userId: uuidv4(),
                        email: req.body.email,
                        passwd_hash: hash,
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        address: req.body.address,
                        phone_number: req.body.phone_number,
                    });

                    usr.save().then(user => {
                        res.status(201).json({"message": "success"});
                    }).catch(err => {
                        res.status(500).json({"message": err});
                    });
                });
            });
        }
    }).catch(err => {
        return res.status(500).json(err);
    });
}));

router.post("/oauth/token", ((req, res) => {

    // check for missing params

    if (!req.body.username) {
        return res.status(400).json({"message": "missing email"});
    }

    if (!req.body.password) {
        return res.status(400).json({"message": "missing password"});
    }

    Account.findOne({
        email: req.body.username,
    }).then((foundUser) => {

        if (foundUser) {

            bcrypt.compare(req.body.password, foundUser.passwd_hash, function(err, passMatch) {

                if (passMatch) {
                    var payload = {
                        exp: Math.floor(Date.now() / 1000) + (60 * 60),
                        userId: foundUser.userId,
                        email: foundUser.email,
                    };
                    var token = jwt.sign(payload, SECRET);

                    return res.status(200).json({"access_token": token});
                } else {
                    return res.status(403).json({"message": "access denied"});
                }
            });
        } else {
            return res.status(403).json({"message": "access denied"});
        }
    }).catch(err => {
        return res.status(500).json(err);
    });

}));

router.get('/api/v1/profile', auth, ((req, res) => {

    Profile.findOne({
        userId: req.user.userId || "123",
    }).then((pref) => {

        if (pref) {
            return res.status(200).json({
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                permits: pref.universe_permits,
                overtime: pref.willing_to_do_overtime,
                relocate: pref.willing_to_relocate_to_other_universe,
                education: pref.education_level,
                skills: pref.skills
            });
        }
        return res.status(200).json({
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            permits: null,
            overtime: null,
            relocate: null,
            education: 0,
            skills: []
        });


    }).catch(err => {
        res.status(500).json({message: "error", err: err});

    });
}));

router.put('/api/v1/profile', auth, ((req, res) => {


    if (!req.body.skills) {
        return res.status(400).json({"message": "missing skills"});
    }

    if (!req.body.permits) {
        return res.status(400).json({"message": "missing permits"});
    }


    if (req.body.overtime === undefined) {
        return res.status(400).json({"message": "missing over_time"});
    }


    if (req.body.relocate  === undefined) {
        return res.status(400).json({"message": "missing will_reloacate"});
    }


    if (req.body.education !== undefined) {
        return res.status(400).json({"message": "missing education"});
    }



    Profile.findOne({
        userId: req.user.userId,
    }).then((pref) => {

        if (!pref) {
            pref = new Profile({});
            pref.userId = req.user.userId || "123";
        }

        pref.universe_permits = req.body.permits;
        pref.willing_to_do_overtime = req.body.overtime;
        pref.willing_to_relocate_to_other_universe = req.body.relocate;
        pref.education_level = req.body.education;
        pref.skills = req.body.skills;

        return pref.save();

    })
        .then(pref => {
            return res.status(200).json({message: "success"});
        })
        .catch(err => {
        res.status(500).json({message: "error", err: err});

    });
}));

router.post('/api/v1/jobs', ((req, res) => {


    if (!req.body.description_en) {
        return res.status(400).json({"message": "missing description_en"});
    }

    if (req.body.salary !== undefined) {
        return res.status(400).json({"message": "missing salary"});
    }

    if (!req.body.location) {
        return res.status(400).json({"message": "missing location"});
    }

    if (req.body.work_universe !== undefined) {
        return res.status(400).json({"message": "missing work_universe"});
    }

    if (req.body.education !== undefined) {
        return res.status(400).json({"message": "missing education"});
    }

    if (!req.body.required_skills) {
        return res.status(400).json({"message": "missing required_skills"});
    }

    var job = new Job(
        {
            id: uuidv4(),
            description_en: req.body.description_en,
            description_fr: req.body.description_fr,
            salary: req.body.salary,
            location: req.body.location,
            work_universe: req.body.work_universe,
            required_skill: req.body.required_skills,
            education_level: req.body.education
        });

    job.save()
        .then(saved => {
            return res.status(201).json({message: "success"});

        })
        .catch(err => {
            return res.status(500).json({message: "error", error: err});
        });
}));

router.get('/api/v1/jobs', ((req, res) => {

    let mongooseQuery = Job.find({}).sort("-date");

    mongooseQuery.exec().then((results) => {
        let jobs = [];
        results.forEach((result) => {
            jobs.push({
                id: result.id,
                description_en: result.description_en,
                description_fr: result.description_fr,
                salary: result.salary,
                location: result.location,
                work_universe: result.work_universe,
                required_skills: result.required_skill,
                date: result.date_posted,
                education: result.education_level
            });
        });

        return jobs;
    }).then((jobs => {
        res.status(200).json(jobs);
    })).catch(err => {
        return res.status(500).json(err);
    });

}));

router.delete('/api/v1/jobs/:jobId', ((req, res) => {

    Job.findOne({id: req.params.jobId}).then((job) => {

        if (!job) {
            return res.status(404).json({"message": "Job not found"});
        } else {

            Job.findOneAndDelete({id: req.params.jobId}).then((foundJob) => {

                if (foundJob) {
                    return res.status(200).json({"message": "Job succesfully deleted."});
                }
            });
        }
    }).catch(err => {
        return res.status(500).json(err);
    });
}));

router.get('/api/v1/jobs/:jobId', ((req, res) => {

    Job.findOne({id: req.params.jobId}).then((job) => {

        if (!job) {
            return res.status(404).json({"message": "Job not found"});
        } else {
            res.status(200).json(
            {
                id: job.id,
                description_en: job.description_en,
                description_fr: job.description_fr,
                salary: job.salary,
                location: job.location,
                work_universe: job.work_universe,
                required_skills: job.required_skill,
                date: job.date_posted,
                education: job.education_level
            });
        }
    }).catch(err => {
        return res.status(500).json(err);
    });
}));

module.exports = router;

