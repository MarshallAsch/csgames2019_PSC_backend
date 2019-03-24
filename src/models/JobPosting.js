/**
 * Defines a mongoose accounts for User objects.
 *
 * @see module:models/user
 */
"use strict";

const mongoose = require("mongoose");

const job = new mongoose.Schema({
    // account email
    id: {
        type: String,
        required: true,
    },
    description_en: {
        type: String,
        required: true,
    },
    description_fr: {
        type: String,
        required: false,
    },
    salary: {
        type: Number,
        required: true,
        default: 70000
    },
    location: {
        latitude: {
            type: Number
        },
        longitude: {
            type: Number
        },
        address: {
            type: String
        }
    },
    // bcrypt.hashSync(passwd, SALT_ROUNDS)
    work_universe: {
        type: Number,
        required: true,
        default: 0
    },
    required_skill: {
        type: [String]
    },
    date_posted: {
        type: Date,
    },
    education_level: {
        type: Number,
        default: 2
    }
});


module.exports = mongoose.model("JobPostings", job);
