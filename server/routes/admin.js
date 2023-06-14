const express = require('express');

const { body } = require('express-validator');

const router = express.Router();

const adminController = require('../controllers/admin');

router.post(
  '/add-product',
  [
    body('title', 'Please enter Title least 4 characters.').isLength({
      min: 4,
    }),
    body('price', 'Please enter large or equal 10.').isInt({ min: 10 }),
    body(
      'description',
      'Please enter a Description at least 4 characters.'
    ).isLength({ min: 4 }),
  ],
  adminController.postAddProduct
);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post(
  '/edit-product/:productId',
  [
    body('title', 'Please enter Title least 4 characters.').isLength({
      min: 4,
    }),
    body('price', 'Please enter large or equal 10.').isInt({ min: 10 }),
    body(
      'description',
      'Please enter a Description at least 4 characters.'
    ).isLength({ min: 4 }),
  ],
  adminController.postEditProduct
);

router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;
