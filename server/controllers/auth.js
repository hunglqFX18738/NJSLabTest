const bcrypt = require('bcryptjs');
// const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user');

// const transporter = nodemailer.createTransport(
//   sendgridTransport({
//     auth: {
//       api_key:
//         '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',
//     },
//   })
// );

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors.array());
    return res.json({
      errorMessage: errors.array()[0].msg,
      status: 'fail',
    });
  }
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.json({ status: 'incorrect' });
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.json({ status: 'success' });
            });
          }
          res.json({ status: 'incorrect' });
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      res.status(500).json({
        status: 'server-error',
      });
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors.array());
    return res.json({
      errorMessage: errors.array()[0].msg,
      status: 'fail',
    });
  }
  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then(result => {
      res.json({ status: 'success' });
    })
    .catch(err => {
      res.status(500).json({
        status: 'server-error',
      });
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    // res.redirect('/');
  });
};
