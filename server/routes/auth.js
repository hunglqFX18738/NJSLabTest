const express = require('express');

const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

// router.get('/auth', authController.isAuthenticated);

router.use(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters.'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

router.use(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              'E-Mail exists already, please pick a different one.'
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters.'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      }),
  ],
  authController.postSignup
);
// router.use('/signup', authController.postSignup);

router.post('/logout', authController.postLogout);

module.exports = router;
