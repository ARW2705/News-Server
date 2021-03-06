'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const User = require('./models/user');
const TOKEN_KEY = process.env.TOKEN_KEY;
const RESET_TOKEN_KEY = process.env.RESET_TOKEN_KEY;

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = user => {
  return jwt.sign(user, TOKEN_KEY, {expiresIn: '30d'});
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = TOKEN_KEY;

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
  User.findOne({_id: jwt_payload._id}, (err, user) => {
    if (err) {
      return done(err, false);
    } else if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
}));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = (req, res, next) => {
  if (req.user.admin) {
    next();
  } else {
    const err = new Error('Unauthorized');
    err.status = 403;
    return next(err);
  }
};

exports.getPasswordResetToken = user => {
  return jwt.sign(user, RESET_TOKEN_KEY, {expiresIn: 15 * 60 * 1000});
};

const passwordOpts = {};
passwordOpts.jwtFromRequest = ExtractJwt.fromUrlQueryParameter('password-token');
passwordOpts.secretOrKey = RESET_TOKEN_KEY;

exports.jwtPassportPassword = passport.use('password-token', new JwtStrategy(passwordOpts, (jwt_payload, done) => {
  User.findOne({_id: jwt_payload._id}, (err, user) => {
    if (err) {
      return done(err, false);
    } else if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
}));

exports.verifyPasswordReset = passport.authenticate('password-token', {session: false});
