const express = require('express');
const userRoutes = require('./server/user/user.route');
const receiptRoutes = require('./server/receipt/receipt.route');
const imageRoutes = require('./server/image/image.route');
const router = express.Router(); // eslint-disable-line new-cap

// TODO: use glob to match *.route files

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount user routes at /users
router.use('/users', userRoutes);
router.use('/receipts', receiptRoutes);
router.use('/', imageRoutes)

module.exports = router;
