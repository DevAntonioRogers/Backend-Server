const express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');
const Campsite = require('../models/campsite');


const favoriteRouter = express.Router();


favoriteRouter.options('/', cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
});

favoriteRouter.options('/:campsiteId', cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
});


favoriteRouter.route('/')
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate('user')
      .populate('campsites')
      .then((favorites) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        res.json(favorites);
      })
      .catch((err) => next(err));
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          req.body.forEach((campsite) => {
            if (!favorite.campsites.includes(campsite._id)) {
              favorite.campsites.push(campsite._id);
            }
          });
          favorite.save()
            .then((favorite) => {
              res.setHeader('Content-Type', 'application/json');
              res.status(200);
              res.json(favorite);
            })
            .catch((err) => next(err));
        } else {
          Favorite.create({ user: req.user._id, campsites: req.body })
            .then((favorite) => {
              res.setHeader('Content-Type', 'application/json');
              res.status(200);
              res.json(favorite);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(403);
    res.end('Operation not supported');
  })


  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          res.setHeader('Content-Type', 'application/json');
          res.status(200);
          res.json(favorite);
        } else {
          res.setHeader('Content-Type', 'text/plain');
          res.status(200);
          res.end('You do not have any favorites to delete.');
        }
      })
      .catch((err) => next(err));
  });






favoriteRouter.route('/:campsiteId')

  .get(cors.cors, (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(403);
    res.end('Operation not supported');
  })



  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          if (favorite.campsites.includes(req.params.campsiteId)) {
            res.setHeader('Content-Type', 'text/plain');
            res.status(200);
            res.end('That campsite is already in the list of favorites!');
          } else {
            favorite.campsites.push(req.params.campsiteId);
            favorite.save()
              .then((favorite) => {
                res.setHeader('Content-Type', 'application/json');
                res.status(200);
                res.json(favorite);
              })
              .catch((err) => next(err));
          }
        } else {
          Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
            .then((favorite) => {
              res.setHeader('Content-Type', 'application/json');
              res.status(200);
              res.json(favorite);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })





  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {

    res.setHeader('Content-Type', 'text/plain');
    res.status(403);
    res.end('Operation not supported');
  })


  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          const index = favorite.campsites.indexOf(req.params.campsiteId);
          if (index !== -1) {
            favorite.campsites.splice(index, 1);
            favorite.save()
              .then((favorite) => {
                res.setHeader('Content-Type', 'application/json');
                res.status(200);
                res.json(favorite);
              })
              .catch((err) => next(err));
          } else {
            res.setHeader('Content-Type', 'text/plain');
            res.status(200);
            res.end('Campsite not found in favorites!');
          }
        } else {
          res.setHeader('Content-Type', 'text/plain');
          res.status(200);
          res.end('Favorites not found for user!');
        }
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
