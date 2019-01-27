const Receipt = require('./receipt.model');
const fetch = require('node-fetch');
const retry = require('async-retry')
const FormData = require('form-data');
const fs = require('fs');

const tabScannerKey = 'WtFkbd9wE9kStLMxAIzcDZUfUs46GnsxiD9c06pHoddNHspQj8RoLmyScemb4Pov';
const categorizerURL = 'https://rcpt-categories.herokuapp.com/api'
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
  console.log('in ocr')
  let ocr = await fetch(`https://api.tabscanner.com/${tabScannerKey}/process`, {
    method: 'POST',
    body: formData
  });

  console.log("past ocr")
  ocr = await ocr.json()
  
  console.log(ocr)

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
    if (data.code >= 400) bail(new Error('failure'))
    return data;
  })
  contents = contents.result;

  res.locals.business = contents.establishment;
  res.locals.subtotal = contents.subtotal;
  res.locals.date = contents.date;
  res.locals.total = contents.total;
  res.locals.listItems = contents.listItems;
  res.locals.taxPaid = contents.tax;

  next()
}

async function categorize(req, res, next) {
  let business = res.locals.business;
  try {
    let result = await fetch(`${categorizerURL}?business=${business}`, {
      method: 'GET'
    });
    result = await result.json();
    res.locals.categories = result.categories;
  } catch(e) {
    next(e)
  }
  next()
}

/**
 * Create new receipt
 * @property {string} req.body.receiptname - The receiptname of receipt.
 * @property {string} req.body.mobileNumber - The mobileNumber of receipt.
 * @returns {Receipt}
 */
async function create(req, res, next) {
  let receipt = new Receipt();
  receipt.image = req.file.path;
  receipt.business = res.locals.business;
  receipt.subtotal = res.locals.subtotal;
  receipt.totalCost = res.locals.total;
  receipt.listItems = res.locals.listItems;
  receipt.taxPaid = res.locals.taxPaid;
  receipt.date = res.locals.date;
  if (!!res.locals.categories) {
    res.locals.categories.forEach(i => {
      receipt.categories.push({name: i})
    })
  }

  try {
    let saved = await receipt.save();
    await res.json(saved);
  } catch (e) {
    next(e)
  }
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


module.exports = { load, get, create, update, list, remove, ocr, categorize };
