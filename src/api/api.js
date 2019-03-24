
const mongoose = require("mongoose");

const jwt  = require('jsonwebtoken');

const bcrypt = require("bcrypt");
const uuidv4 = require('uuid/v4');
const source = require("rfr");


const Account = source("./src/models/Accounts");
const Profile = source("./src/models/Profile");



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

    router.post("/auth/signup", ((req, res) => {

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

    router.post("/auth/login", ((req, res) => {

        // check for missing params

        if (!req.body.email) {
            return res.status(400).json({"message": "missing email"});
        }

        if (!req.body.password) {
            return res.status(400).json({"message": "missing password"});
        }

        Account.findOne({
            email: req.body.email,
        }).then((foundUser) => {

            if (foundUser) {

                bcrypt.compare(req.body.password, foundUser.passwd_hash, function(err, passMatch) {

                    if (passMatch) {
                        var payload = {
                            userId: foundUser.userId,
                            email: foundUser.email,
                            fullName: foundUser.fullName,
                        };
                        var token = jwt.sign(payload, SECRET);

                        return res.status(200).json({"acccessToken": token});
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



    router.get('/profile', auth, ((req, res) => {

        Profile.findOne({
            userId: req.user.userId || "123",
        }).then((pref) => {

            if (pref) {
                return res.status(200).json(pref);
            }
            return res.status(200).json({});


        }).catch(err => {
            res.status(500).json({message: "error", err: err});

        });
    }));

router.put('/profile', auth, ((req, res) => {


    if (!req.body.skills) {
        return res.status(400).json({"message": "missing skills"});
    }

    if (!req.body.universe_permits) {
        return res.status(400).json({"message": "missing permits"});
    }


    if (req.body.over_time === undefined) {
        return res.status(400).json({"message": "missing over_time"});
    }


    if (req.body.will_reloacate  === undefined) {
        return res.status(400).json({"message": "missing will_reloacate"});
    }


    if (!req.body.education) {
        return res.status(400).json({"message": "missing education"});
    }



    Profile.findOne({
        userId: req.user.userId,
    }).then((pref) => {

        if (!pref) {
            pref = new Profile({});
            pref.userId = req.user.userId || "123";
        }

        pref.universe_permits = req.body.universe_permits;
        pref.willing_to_do_overtime = req.body.over_time;
        pref.willing_to_relocate_to_other_universe = req.body.will_reloacate;
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


        /*
        router.get("/articles", ((req, res) => {

            let mongooseQuery = Article.find({}).sort("-date");

            mongooseQuery.exec().then((results) => {
                let articles = [];
                results.forEach((result) => {
                    articles.push( {
                        id: result.id,
                        title: result.title,
                        subtitle: result.subtitle,
                        leadParagraph: result.leadParagraph,
                        imageUrl: result.imageUrl,
                        body: result.body,
                        author: result.author,
                        userId: result.userId,
                        date: result.date,
                        category: result.category,
                    });
                });

                return articles;
            }).then((articles => {
                res.status(200).json(articles);
            })).catch(err => {
                return res.status(500).json(err);
            });

        }));

        router.post("/articles", (req, res) => {

            if(!req.headers.authorization) {
                return res.status(403).json({"message" : "missing token"});
            }

            let token = req.headers.authorization;

            //Remove Bearer from string
            token = token.slice(7, token.length);

            jwt.verify(token, SECRET, (err, decoded) => {
                if (err) {
                    return res.status(403).json({"message" : "invalid token"});
                }
                else {
                    //check article
                    if (!req.body.body || !req.body.title || !req.body.subtitle || !req.body.leadParagraph)
                    {
                        return res.status(400).json({"message" : "invalid article"});
                    }

                    var uuid = uuidv4();

                    uuid = uuid.replace(/-/g, "").slice(0,16);

                    let article = new Article({
                        id: uuid,
                        userId : decoded.userId,
                        author : decoded.fullName,
                        title : req.body.title,
                        subtitle : req.body.subtitle,
                        leadParagraph : req.body.leadParagraph,
                        imageUrl : req.body.imageUrl,
                        body : req.body.body,
                        category : req.body.category
                    });

                    article.save().then(article => {
                        //return unique id here
                        res.status(201).json({"message": "Success", id: article.id});
                    }).catch(err => {
                        res.status(500).json({"message": err});
                    });
                }
            });

        });
*/



module.exports = router;

