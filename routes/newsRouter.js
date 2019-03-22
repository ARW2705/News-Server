'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);
const User = require('../models/user');

const newsRouter = express.Router();

newsRouter.use(bodyParser.json());

// Get headlines - user login NOT required
newsRouter.route('/')
  .get((req, res, next) => {
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
        res.send(response);
      })
      .catch(err => next(err));
  });

// Perform query - user login NOT required
newsRouter.route('/search')
  .get((req, res, next) => {
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
        res.send(response);
      })
      .catch(err => next(err));
  });

// Get a list of available api sources - user login NOT required
newsRouter.route('/sources')
  .get((req, res, next) => {
    const options = {};
    if (req.query) {
      for (const key in req.query) {
        options[key] = req.query[key];
      }
    }
    newsapi.v2.sources(options)
      .then(response => {
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.send(response);
      })
      .catch(err => next(err));
  });

// Get headlines using user preferences - user login required
newsRouter.route('/preferred')
  .get(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user.id)
      .then(user => {
        const options = {
          page: 1
        };
        if (user.preferredSources.length) {
          options['sources'] = user.preferredSources.join(',');
        } else {
          options['country'] = user.country;
        }
        newsapi.v2.topHeadlines(options)
          .then(response => {
            res.statusCode = 200;
            res.setHeader('content-type', 'application/json');
            res.send(response);
          })
          .catch(err => next(err));
      })
      .catch(err => next(err));
  });

// Perform query search with user preferences - user login required
newsRouter.route('/preferred/search')
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
            res.send(response);
          })
          .catch(err => next(err));
      })
      .catch(err => next(err));
  });

module.exports = newsRouter;
