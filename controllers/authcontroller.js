const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const path = require('path');
const bCrypt = require("bcrypt");
const db = require("../models");
const express = require('express');
const router = express.Router();

//USE SECRET
router.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
router.use(passport.initialize());
router.use(passport.session()); //persistent login sessions
router.use(express.static(path.join(__dirname, '../views')));
passport.use(
  new Strategy(function(username, password, cb) {
    db.User.findOne({
      where: {
        username: username
      }
    })
      .then(user => {
        //compare incoming password to hashed password from DB
        bCrypt.compare(password, user.password, (err, match) => {
          if (err) throw err;

          if (match) {
            return cb(null, user);
          }
        });
      })
      .catch(err => {
        console.log(err);
      });
  })
);

passport.serializeUser(function(user, cb) {
  cb(null, user.username);
});

passport.deserializeUser(function(username, cb) {
  db.User.findOne({
    where: {
      username: username
    }
  })
    .then(user => {
      cb(null, user);
    })
    .catch(err => {
      console.log(err);
    });
});

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/accounts.html'));
})
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, ('../views/signin.html')));
})

router.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), (req, res) => {
    res.sendFile(path.join(__dirname, ('../views/accounts.html')));
})

router.get('/logout', (req, res) => {
    req.logout();
    res.sendFile('../views/accounts.html');
});

router.get('/profile', passport.authenticate('local', {failureRedirect: '/'}), (req, res) => {
    res.sendFile(path.join(__dirname, '../views/authorized.html'));
})

module.exports = router;