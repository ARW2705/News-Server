'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const User = require('../models/user');
const authenticate = require('../authenticate');

const userRouter = express.Router();

userRouter.use(bodyParser.json());

userRouter.route('/checkJWTToken')
  .get((req, res) => {
    passport.authenticate('jwt', {session: false}, (err, user, data) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.statusCode = 401;
        res.setHeader('content-type', 'application/json');
        return res.json({status: 'JWT invalid', success: false, err: data});
      } else {
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        return res.json({status: 'JWT valid', success: true, user: user});
      }
    })(req, res);
  });

userRouter.route('/login')
  .post((req, res, next) => {
    passport.authenticate('local', (err, user, data) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.statusCode = 401;
        res.setHeader('content-type', 'application/json');
        res.json({success: false, status: 'Login Unsuccessful', err: data});
      }
      req.logIn(user, err => {
        if (err) {
          return next(err);
        }
        const token = authenticate.getToken({_id: req.user._id});
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.json({success: true, token: token, status: 'Successfully logged in'});
      });
    })(req, res, next);
  });

userRouter.route('/signup')
  .post((req, res, next) => {
    User.register(new User({username: req.body.username}),
      req.body.password,
      (err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.json({error: err});
        } else {
          if (req.body.firstname) {
            user.firstname = req.body.firstname;
          }
          if (req.body.lastname) {
            user.lastname = req.body.lastname;
          }
          if (req.body.language) {
            user.language = req.body.language;
          }
          if (req.body.country) {
            user.country = req.body.country;
          }
          user.email = req.body.email;
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('content-type', 'application/json');
              res.json({error: err});
              return;
            }
            passport.authenticate('local')(req, res, () => {
              res.statusCode = 200;
              res.setHeader('content-type', 'application/json');
              res.json({success: true, status: 'Registration successful'});
            });
          });
        }
      });
  });

userRouter.route('/profile/:id')
  .get(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user.id)
      .then(user => {
        console.log(user);
        if (user.id != req.params.id) {
          res.statusCode = 401;
          res.setHeader('content-type', 'application/json');
          res.json({error: 'Username does not match login'});
        } else {
          res.statusCode = 200;
          res.setHeader('content-type', 'applications/json');
          res.json({
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            preferredSources: user.preferredSources,
            receiveNotifications: user.receiveNotifications,
            country: user.country,
            language: user.language
          });
        }
      })
      .catch(err => next(err));
  })
  .patch(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user.id)
      .then(user => {
        console.log(user);
        if (user.id != req.params.id) {
          res.statusCode = 401;
          res.setHeader('content-type', 'application/json');
          res.json({error: 'Username does not match login'});
        } else {
          if (req.body.firstname) {
            user.firstname = req.body.firstname;
          }
          if (req.body.lastname) {
            user.lastname = req.body.lastname;
          }
          if (req.body.email) {
            user.email = req.body.email;
          }
          if (req.body.preferredSources) {
            user.preferredSources = req.body.preferredSources;
          }
          if (req.body.receiveNotifications) {
            user.receiveNotifications = req.body.receiveNotifications;
          }
          if (req.body.country) {
            user.country = req.body.country;
          }
          if (req.body.language) {
            user.language = req.body.language;
          }
          user.save()
            .then(user => {
              res.statusCode = 200;
              res.setHeader('content-type', 'application/json');
              res.json({
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                preferredSources: user.preferredSources,
                receiveNotifications: user.receiveNotifications,
                country: user.country,
                language: user.language
              })
            })
            .catch(err => {
              res.statusCode = 500;
              res.setHeader('content-type', 'application/json');
              res.json({error: err});
              return;
            });
        }
      })
      .catch(err => next(err));
  });

module.exports = userRouter;
