require('../models/User');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = mongoose.model('users');
const passport = require('passport');

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/register', (req, res) => {
  let errors = [];

  if(!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
    errors.push({text: 'Invalid name'});
  };

  if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
    errors.push({text: 'Invalid email'});
  };

  if(!req.body.password || typeof req.body.password == undefined || req.body.password == null) {
    errors.push({text: 'Invalid password'});
  };

  if(!req.body.password2 || typeof req.body.password2 == undefined || req.body.password2 == null) {
    errors.push({text: 'Invalid repeat password'});
  };

  if(req.body.password.length < 4) {
    errors.push({text: 'Password too short'});
  };

  if(req.body.password != req.body.password2) {
    errors.push({text: 'Passwords do not match'});
  };

  if(errors.length > 0) {
    res.render('users/register', {errors: errors});
  } else {
    User.findOne({email: req.body.email}).lean().then((user) => {
      if(user) {
        req.flash('error_msg', 'An account with this email already exists');
        res.redirect('/users/register');
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) {
              req.flash('error_msg', 'There was an error saving the user');
              res.redirect('/');
            };

            newUser.password = hash;
            newUser.save().then(() => {
              req.flash('success_msg', 'User created successfully');
              res.redirect('/');
            }).catch(() => {
              req.flash('error_msg', 'There was an error creating the user. Try again!');
              res.redirect('/users/register');
            });
          });
        });
      };
    }).catch(() => {
      req.flash('error_msg', 'Internal Error');
      res.redirect('/');
    });
  };
});

router.get('/login', (req, res) => {
  res.render('users/login');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if(err) return next(err);
    req.flash('success_msg', 'Successfully logged out!');
    res.redirect('/');
  });
});

module.exports = router;