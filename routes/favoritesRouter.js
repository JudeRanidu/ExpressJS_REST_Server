const express = require('express')
const bodyParser = require('body-parser')
const Favorites = require('../models/favorite')
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoritesRouter = express.Router()

favoritesRouter.use(bodyParser.json())

favoritesRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        if (favorites != null) {
            if (favorites.user._id.equals(req.user._id)) {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(favorites)
            }
            else {
                res.statusCode = 403
                res.setHeader('Content-Type', 'application/json')
                res.end('You are not authorized to perform this operation!')
            }
        } 
        else {
            err = new Error('Favorites for '+req.user._id+' not found')
            err.status = 404
            return next(err)
        }
    }), (err) => next(err)
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (favorites != null) {
            if (favorites.user._id.equals(req.user._id)) {
                for (var i = (req.body.length -1); i >= 0; i--) {
                    if (favorites.dishes.indexOf(req.body[i]._id) == -1) {
                        favorites.dishes.push(req.body[i]._id)
                    }
                }
                favorites.save().then((favorites) => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorites)
                }, (err) => next(err))
            }
            else {
                res.statusCode = 403
                res.setHeader('Content-Type', 'application/json')
                res.end('You are not authorized to perform this operation!')
            }
        }
        else {
            Favorites.create({
                user : req.user._id,
                dishes : req.body
            }).then((favorites) => {
                console.log('Fvorites record created', favorites)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(favorites)
            }, (err) => next(err))
        }
    })
    .catch((err) => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403
    res.end('PUT method not supported on /favorites')
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (favorites != null) {
            if (favorites.user._id.equals(req.user._id)) {
                Favorites.remove({user: req.user._id}).then((resp) => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(resp)
                }, (err) => next(err))
            }
            else {
                res.statusCode = 403
                res.setHeader('Content-Type', 'application/json')
                res.end('You are not authorized to perform this operation!')
            }
        }
        else {
            err = new Error('Favorites for '+req.user._id+' not found')
            err.status = 404
            return next(err)
        }
    })
    .catch((err) => next(err))
})


favoritesRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403
    res.end('GET method not supported on /favorites/'+req.params.dishId)
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (favorites != null) {
            if (favorites.user._id.equals(req.user._id)) {
               
                if (favorites.dishes.indexOf(req.params.dishId) != -1) {
                    res.statusCode = 409
                    res.setHeader('Content-Type', 'application/json')
                    res.end('Dish already exists in your favorites!')
                }
                else {
                    favorites.dishes.push(req.params.dishId)
                    favorites.save().then((favorites) => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json')
                        res.json(favorites)
                    }, (err) => next(err))
                }
                
            }
            else {
                res.statusCode = 403
                res.setHeader('Content-Type', 'application/json')
                res.end('You are not authorized to perform this operation!')
            }
        }
        else {
            Favorites.create({
                user : req.user._id,
                dishes : [req.params.dishId]
            }).then((favorites) => {
                console.log('Fvorites record created', favorites)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(favorites)
            }, (err) => next(err))
        }
    })
    .catch((err) => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403
    res.end('PUT method not supported on /favorites/'+req.params.dishId)
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (favorites != null) {
            if (favorites.user._id.equals(req.user._id)) {
                favorites.dishes.remove(req.params.dishId)
                favorites.save().then((favorites) => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorites)
                }, (err) => next(err))
            }
            else {
                res.statusCode = 403
                res.setHeader('Content-Type', 'application/json')
                res.end('You are not authorized to perform this operation!')
            }
        }
        else {
            err = new Error('Favorites for '+req.user._id+' not found')
            err.status = 404
            return next(err)
        }
    })
    .catch((err) => next(err))
})


module.exports = favoritesRouter