'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
  firstname: {
    type: String,
    default: ''
  },
  lastname: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    default: false
  },
  preferredSources: [{
    type: String
  }],
  receiveNotifications: {
    type: Boolean,
    default: false
  },
  country: {
    type: String,
    default: 'us'
  },
  language: {
    type: String,
    default: 'en'
  }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
