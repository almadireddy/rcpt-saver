const express = require('express');
const receiptController = require('./receipt.controller');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now() + '.jpeg')
  }
})

const upload = multer({ storage: storage })
const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get(receiptController.list)
  .post(
    upload.single('image'), 
    receiptController.ocr,
    receiptController.categorize,
    receiptController.create);

router.route('/:id')
  .get(receiptController.get)
  .delete(receiptController.remove);

module.exports = router;
