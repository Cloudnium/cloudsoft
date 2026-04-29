const express = require('express');
const router  = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, (req, res) => {
  res.render('sections/placeholder', {
    layout: 'main',
    title: 'CLOUDSOFT',
    activeMenu: 'movimientos',
    pageTitle: 'movimientos',
  });
});

module.exports = router;
