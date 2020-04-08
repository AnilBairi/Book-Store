const express = require('express');
const router = express.Router();
// const session = require('express-session');
const { check, validationResult } = require('express-validator');
// const flash = require('connect-flash');
// const url = require('url');

//Bring Books Model
const Books = require('../models/books');

//Bring Books Model
const User = require('../models/user');

// Add Book
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('add_book');
});

// Post Add Book
router.post('/add', ensureAuthenticated, [
    check('title').isLength({ min: 1 }).trim().withMessage('Title required'),
    check('body').isLength({ min: 1 }).trim().withMessage('Body required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return res.status(422).json({ errors: errors.array() });
        // req.flash(errors);
        // res.redirect('/books/add');
        console.log(`Error while adding book by user: ${req.user.name}`);
        res.render('add_book', {
            errors: errors.array()
        });
        
    }
    let book = new Books();
    book.title = req.body.title;
    book.author = req.user._id;
    book.body = req.body.body;

    book.save((err) => {
        if (err) {
            console.log(err);
        } else {
            req.flash('success', 'Book successfully added.')
            res.redirect('/');
        }
    });
});

// Get Signle Book by ID
router.get('/:id', ensureAuthenticated, (req, res) => {
    Books.findById(req.params.id, (err, book) => {
        User.findById(book.author, (err, user) => {
            if (err) {
                console.log(err);
            } else {
                res.render('book', {
                    book: book,
                    author: user.name
                })
            }
        });
    });
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Books.findById(req.params.id, (err, book) => {
        if (req.user.id !== book.author) {
            console.log(`You are not authorized to edit book '${book.title}'`)
        } else if (err) {
            console.log(err);
        } else {
            console.log(`Updating book:${book}`);
            res.render('edit_book', {
                book: book
            })
        }

    });
});

// Update Book
router.post('/edit/:id', ensureAuthenticated, (req, res) => {
    let book = {
        title: req.body.title,
        author: req.user._id,
        body: req.body.body
    }
    let query = { _id: req.params.id };
    Books.updateOne(query, book, err => {
        if (err) {
            console.log(`Error while updating book:${err}`);
        } else {
            console.log(`Successfully updated book:${book.title} by ${book.author}`);
            res.redirect('/');
        }
    })
});

// Delete Book by Id
router.delete('/:id', ensureAuthenticated, (req, res) => {
    console.log(`Deletion in progress...`);
    let query = { _id: req.params.id };
    Books.deleteOne(query, err => {
        if (err) {
            console.log(`Error while deleting book:${err}`);
        } else {
            res.send('success');
        }
    })
});

//Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

module.exports = router;