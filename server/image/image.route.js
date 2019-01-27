const express = require('express');
const path = require('path');
const router = express.Router(); // eslint-disable-line new-cap

router.route('/uploads/:p').get((req, res) => {
  res.sendFile(path.join(__dirname, '../../uploads', req.params.p.trim()));
})

module.exports = router;
