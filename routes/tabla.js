const express = require('express');
const router  = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, (req, res) => {
  res.render('sections/placeholder', {
    layout: 'main',
    title: 'CLOUDSOFT',
    activeMenu: 'tabla',
    pageTitle: 'tabla',
  });
});

module.exports = router;
