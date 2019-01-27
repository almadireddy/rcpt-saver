const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');


const LineItemSchema = new mongoose.Schema({
  quantity: Number,
  description: String,
  price: Number,
  itemTotal: Number
});

/**
 * User Schema
 */
const ReceiptSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  image: String,
  business: String,
  subtotal: Number,
  totalCost: Number,
  listItems: [LineItemSchema],
  taxPaid: Number,
  date: {
    type: Date,
    default: Date.now
  },
  categories: [new mongoose.Schema({name: String})]
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
ReceiptSchema.method({
});

/**
 * Statics
 */
ReceiptSchema.statics = {
  /**
   * Get receipt
   * @param {ObjectId} id - The objectId of receipt.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((receipt) => {
        if (receipt) {
          return receipt;
        }
        const err = new APIError('No such receipt exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List receipts in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of receipts to be skipped.
   * @param {number} limit - Limit number of receipts to be returned.
   * @returns {Promise<User[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model('Receipt', ReceiptSchema);
