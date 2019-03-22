'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const profileMap = require('../utils/profile-map');

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
const handlebarsOptions = {
  viewEngine: 'handlebars',
  viewPath: path.resolve('../views/password-reset/'),
  extName: '.html'
};
transport.use('compile', hbs(handlebarsOptions));

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
    User.register(new User({username: req.body.username, email: req.body.email}),
      req.body.password,
      (err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.json({error: err});
        } else {
          profileMap(user, req.body);
          user.email = req.body.email;
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('content-type', 'application/json');
              res.json({error: err});
              return;
            }
            passport.authenticate('local')(req, res, () => {
              req.logIn(user, err => {
                if (err) {
                  return next(err);
                }
                const token = authenticate.getToken({_id: req.user._id});
                res.statusCode = 200;
                res.setHeader('content-type', 'application/json');
                res.json({success: true, token: token, status: 'Registration successful'});
              });
            });
          });
        }
      });
  });

userRouter.route('/profile')
  .get(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user.id)
      .then(user => {
        if (user) {
          res.statusCode = 200;
          res.setHeader('content-type', 'applications/json');
          res.json({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            preferredSources: user.preferredSources,
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
        if (user) {
          profileMap(user, req.body);
          user.save()
            .then(user => {
              res.statusCode = 200;
              res.setHeader('content-type', 'application/json');
              res.json({
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                preferredSources: user.preferredSources,
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

userRouter.route('/reset-password')
  .post(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user.id)
      .then(user => {
        if (user) {
          const resetToken = authenticate.getPasswordResetToken({_id: req.user._id});
          const resetEmail = {
            to: user.email,
            from: process.env.EMAIL_USER,
            template: 'request-email',
            subject: 'Password reset request',
            context: {
              name: user.firstname || user.username || 'User',
              url: `${process.env.PASSWORD_RESET_URL}${resetToken}`
            }
          };
          transport.sendMail(resetEmail, err => {
            if (err) {
              res.statusCode = 422;
              res.setHeader('content-type', 'applictaion/json');
              res.json({error: err});
            } else {
              res.statusCode = 200;
              res.setHeader('content-type', 'application/json');
              res.json({message: 'Please check your email for password reset instructions'});
            }
          })
        } else {
          res.statusCode = 404;
          res.setHe('content-type', 'application/json');
          res.json({error: 'User not found'});
        }
      })
      .catch(err => next(err));
  });

userRouter.route('/new-password')
  .post(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user.id)
      .then(user => {
        if (user) {
          user.changePassword(req.body.oldPassword, req.body.newPassword)
            .then(updated => {
              transport.sendMail({
                to: user.email,
                from: process.env.EMAIL_USER,
                template: 'confirm-email',
                subject: 'Password reset confirmation',
                context: {
                  name: user.firstname || user.username || 'User'
                }
              });
              res.statusCode = 200;
              res.setHeader('content-type', 'application/json');
              res.json({success: true, status: 'Password successfully updated'});
            });
        } else {
          res.statusCode = 404;
          res.setHeader('content-type', 'application/json');
          res.json({error: 'User not found'});
        }
      })
      .catch(err => next(err));
  });

module.exports = userRouter;
