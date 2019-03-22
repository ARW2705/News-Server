'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
  username: {
    type: String,
    unique: true
  },
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
    unique: true,
    required: true
  },
  admin: {
    type: Boolean,
    default: false
  },
  preferredSources: [{
    type: String
  }],
  country: {
    type: String,
    default: 'us'
  },
  language: {
    type: String,
    default: 'en'
  }
});

User.plugin(passportLocalMongoose, {
  // Log in with either username or email address
  findByUsername: (model, queryParams) => {
    for (let param of queryParams.$or) {
      if (typeof param == 'object' && param.hasOwnProperty('username')) {
        queryParams.$or.push({email: param.username});
      }
    }
    return model.findOne(queryParams);
  }
});

module.exports = mongoose.model('User', User);
