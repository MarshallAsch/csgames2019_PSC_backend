/**
 * Defines a mongoose accounts for User objects.
 *
 * @see module:models/user
 */
"use strict";

const mongoose = require("mongoose");

const profile = new mongoose.Schema({
    // account email
    userId: {
        type: String,
        required: true,
    },
    universe_permits: {
        type: [Number],
        required: true,
    },
    willing_to_do_overtime: {
        type: Boolean,
        required: true,
        default: false
    },
    willing_to_relocate_to_other_universe: {
        type: Boolean,
        required: true,
        default: false
    },
    education_level: {
        type: Number,
        required: true,
        default: 0
    },
    // bcrypt.hashSync(passwd, SALT_ROUNDS)
    skills: {
        type: [String],
        required: true,
    },
});


module.exports = mongoose.model("Profile", profile);;
