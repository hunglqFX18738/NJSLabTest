const Product = require('../models/product');
// const mongoose = require('mongoose');
const fileHelper = require('../util/file');

const { validationResult } = require('express-validator');

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if (!image) {
    return res.json({
      errorMessage: 'Attached file is not an image.',
      status: 'fail',
    });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    fileHelper.deleteFile(image.path);
    return res.json({
      errorMessage: errors.array()[0].msg,
      status: 'fail',
    });
  }
  const imageUrl = image.path;
  const product = new Product({
    // _id: new mongoose.Types.ObjectId('647720fd8e164078d0e3eff2'),
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.json({ status: 'success' });
    })
    .catch(err => {
      res.status(500).json({
        status: 'server-error',
      });
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.json(product);
    })
    .catch(err => {
      res.status(500).json({
        status: 'server-error',
      });
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (image) {
      fileHelper.deleteFile(image.path);
    }
    return res.json({
      errorMessage: errors.array()[0].msg,
      status: 'fail',
    });
  }
  Product.findById(prodId)
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save();
    })
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.json({ status: 'success' });
    })
    .catch(err => {
      res.status(500).json({
        status: 'server-error',
      });
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndRemove(prodId)
    .then(product => {
      fileHelper.deleteFile(product.imageUrl);
      console.log('DESTROYED PRODUCT');
      // res.redirect('/admin/products');
    })
    .catch(err => {
      res.status(500).json({
        status: 'server-error',
      });
    });
};
