const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const receiptController = require('./receipt.controller');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' })
const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get(receiptController.list)
  .post(upload.single('image'), receiptController.create);

router.route('/:id')
  .get(receiptController.get)
  .delete(receiptController.remove);

/** Load user when API with userId route parameter is hit */
router.param('userId', receiptController.load);

module.exports = router;
