const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

require('../models/User');
const User = mongoose.model('users');

module.exports = function (passport) {
  passport.use(new localStrategy({ usernameField: 'email', passwordField: 'password' }, (email, password, done) => {
    User.findOne({ email: email }).lean().then(user => {
      if (!user) {
        return done(null, false, { message: 'This account does not exist' });
      };

      bcrypt.compare(password, user.password, (error, equals) => {
        if (equals) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Incorrect password' });
        }
      });
    }).catch(() => {
      return done(null, false, { message: 'Internal problem. Try again' });
    });
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  // passport.deserializeUser(function(id, done) {
  //   User.findOne({where:{id:id}}).lean().then((user) => {
  //       done(null, user);
  //   }).catch((err) => {
  //       done(err, null);
  //   });
  // });;
};

