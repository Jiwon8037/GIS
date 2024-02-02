const express = require('express');
const stylesheetRouter = express.Router();
const fs = require('fs');

stylesheetRouter.get('/', (req, res, next) => {
  fs.readFile('./node_modules/ol/ol.css', (err, data) => {
    if (err) {
      next(err)
    } else {
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.write(data);
      res.end();
    }
  });
});

module.exports = stylesheetRouter;
