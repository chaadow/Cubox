var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get('/payment', function(req, res){
    res.render('payment.ejs', {user: req.user});
});

module.exports = router;
