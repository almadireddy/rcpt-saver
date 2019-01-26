const Receipt = require('./receipt.model');
const fetch = require('node-fetch');
const retry = require('async-retry')
const FormData = require('form-data');
const fs = require('fs');

const tabScannerKey = 'U5jZ8RTD2aVSnvUE6CFW2fH8o2k4MXSXTqV18ZisMsQspeeQiroagslb74OpKCIO'
/**
 * Load receipt and append to req.
 */
function load(req, res, next, id) {
  Receipt.get(id)
    .then((receipt) => {
      req.receipt = receipt; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get receipt
 * @returns {Receipt}
 */
function get(req, res) {
  return res.json(req.receipt);
}

async function ocr(req, res, next) {
  let imagePath = req.file.path;
  const formData = new FormData();
  formData.append('image', fs.createReadStream(imagePath, {autoClose: false}));
  
  const headers = new fetch.Headers({
    'Content-Type': 'multipart/form-data; boundary=----thisisaboundary'
  });
  
  let ocr = await fetch(`https://api.tabscanner.com/${tabScannerKey}/process`, {
    method: 'POST',
    body: formData
  });

  ocr = await ocr.json()

  if (ocr.code >= 400) {
    throw new Error("Something went wrong with the image");
  }

  let token = ocr.token;
  let contents = await retry(async bail => {
    const res = await fetch(`https://api.tabscanner.com/${tabScannerKey}/result/${token}`, {
      method: 'GET'
    })
    const data = await res.json()
    if (data.status_code !== 3) throw "this aint it chief";
    return data;
  })
}

/**
 * Create new receipt
 * @property {string} req.body.receiptname - The receiptname of receipt.
 * @property {string} req.body.mobileNumber - The mobileNumber of receipt.
 * @returns {Receipt}
 */
async function create(req, res, next) {
  // First, make OCR request to parse image
  // Then, Get business, line items, make request with those to categorizer
  // then, put everything inside Reciept object and call .save()

  receipt.save()
    .then(savedReceipt => res.json(savedReceipt))
    .catch(e => next(e));
}

/**
 * Update existing receipt
 * @property {string} req.body.receiptname - The receiptname of receipt.
 * @property {string} req.body.mobileNumber - The mobileNumber of receipt.
 * @returns {Receipt}
 */
function update(req, res, next) {
  const receipt = req.receipt;
  receipt.receiptname = req.body.receiptname;
  receipt.mobileNumber = req.body.mobileNumber;

  receipt.save()
    .then(savedReceipt => res.json(savedReceipt))
    .catch(e => next(e));
}

/**
 * Get receipt list.
 * @property {number} req.query.skip - Number of receipts to be skipped.
 * @property {number} req.query.limit - Limit number of receipts to be returned.
 * @returns {Receipt[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Receipt.list({ limit, skip })
    .then(receipts => res.json(receipts))
    .catch(e => next(e));
}

/**
 * Delete receipt.
 * @returns {Receipt}
 */
function remove(req, res, next) {
  const receipt = req.receipt;
  receipt.remove()
    .then(deletedReceipt => res.json(deletedReceipt))
    .catch(e => next(e));
}

module.exports = { load, get, create, update, list, remove, ocr };
