/*jshint node: true */
'use strict';

var mongo_key = process.env.MONGO_KEY || "turbo tajny klucz";

module.exports = {
    key: mongo_key
};