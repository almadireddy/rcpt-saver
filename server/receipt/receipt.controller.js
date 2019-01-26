const Receipt = require('./receipt.model');
const fetch = require('node-fetch');

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

/**
 * Create new receipt
 * @property {string} req.body.receiptname - The receiptname of receipt.
 * @property {string} req.body.mobileNumber - The mobileNumber of receipt.
 * @returns {Receipt}
 */
async function create(req, res, next) {
  let receipt = new Receipt();

  reciept.image.data = fs.readFileSync(req.file.image.path)
  reciept.image.contentType = 'image/jpg';

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

module.exports = { load, get, create, update, list, remove };
