var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = function(io) {
    var app = require('express');
    var router = app.Router();

    io.on('connection', function(socket) {
         console.log("EEEY")
    });

    return router;
}
