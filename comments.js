// Create web server 

// Import modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Comments = require('../models/comments');

// Create express router
const commentRouter = express.Router();

// Use body-parser to parse the body of the incoming request message
commentRouter.use(bodyParser.json());

// Route '/'
commentRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// GET
.get(cors.cors, (req, res, next) => {
    Comments.find(req.query)
    .populate('author')
    .then((comments) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comments);
    }, (err) => next(err))
    .catch((err) => next(err));
})
// POST
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body != null) {
        req.body.author = req.user._id; // Add author field to request body
        Comments.create(req.body)
        .then((comment) => {
            Comments.findById(comment._id)
            .populate('author')
            .then((comment) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comment);
            })
        }, (err) => next(err))
        .catch((err) => next(err));
    } else {
        err = new Error('Comment not found in request body');
        err.statusCode = 404;
        return next(err);
    }
})
// PUT
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // Operation not supported
    res.end('PUT operation not supported on /comments');
})
// DELETE
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Comments.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp); // Return response
    }, (err) => next(err))
    .catch((err) => next(err));
});

// Route '/:commentId'
commentRouter.route('/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
