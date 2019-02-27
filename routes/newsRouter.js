'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('authenticate');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);
const User = require('../models/user');
const cors = require('cors');

const newsRouter = express.Router();

newsRouter.use(bodyParser.json());

newsRouter.route('/')
  .get(cors(), (req, res, next) => {
    const options = {
      country: 'us',
      category: 'general',
      page: 1
    };
    if (req.query) {
      for (const key in req.query) {
        options[key] = req.query[key];
      }
    }
    newsapi.v2.topHeadlines(options)
    .then(response => {
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json');
      res.json(response);
    })
    .catch(err => next(err));
  });

newsRouter.route('/top/:id')
  .get(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user.id)
      .then(user => {
        const options = {
          country: 'us',
          category: 'general',
          page: 1
        };
        if (user.id == req.params.id
            && user.preferredSources.length) {
          options['sources'] = user.preferredSources;
        }
        newsapi.v2.topHeadlines(options)
          .then(response => {
            res.statusCode = 200;
            res.setHeader('content-type', 'application/json');
            res.json(response);
          })
          .catch(err => next(err));
      })
      .catch(err => next(err));
  });

newsRouter.route('/search')
  .get(cors(), (req, res, next) => {
    const options = {
      language: 'en',
      country: 'us',
      page: 1,
      sortBy: 'relevancy'
    };
    if (req.query) {
      for (const key in req.query) {
        options[key] = req.query[key];
      }
    } else {
      // TODO - a query is required
    }
    newsapi.v2.everything(options)
      .then(response => {
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.json(response);
      })
      .catch(err => next(err));
  });

newsRouter.route('/search/:id')
  .get(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user.id)
      .then(user => {
        const options = {
          language: 'en',
          country: 'us',
          page: 1,
          sortBy: 'relevancy'
        };
        if (user.id == req.params.id
            && user.preferredSources.length) {
          options['sources'] = user.preferredSources;
        }
        if (req.query) {
          for (const key in req.query) {
            options[key] = req.query[key];
          }
        } else {
          // TODO a query is required
        }
        newsapi.v2.everything(options)
          .then(response => {
            res.statusCode = 200;
            res.setHeader('content-type', 'application/json');
            res.json(response);
          })
          .catch(err => next(err));
      })
      .catch(err => next(err));
  })

newsRouter.route('/sources')
  .get((req, res, next) => {
    const options = {
      category: 'general',
      language: 'en',
      country: 'us'
    };
    if (req.query) {
      for (const key in req.query) {
        options[key] = req.query[key];
      }
    }
    newsapi.v2.sources(options)
      .then(response => {
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.json(response);
      })
      .catch(err => next(err));
  });

module.exports = newsRouter;
