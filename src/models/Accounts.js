/**
 * Defines a mongoose accounts for User objects.
 *
 * @see module:models/user
 */
"use strict";

const mongoose = require("mongoose");

const accounts = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    // account email
    email: {
        type: String,
        required: true,
    },
    // display name
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone_number: {
        type: String,
        required: true,
    },
    // bcrypt.hashSync(passwd, SALT_ROUNDS)
    passwd_hash: {
        type: String,
        required: true,
    },
});


module.exports = mongoose.model("Accounts", accounts);;
