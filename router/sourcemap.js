const express = require('express');
const sourcemapRouter = express.Router();
const fs = require('fs');

sourcemapRouter.get('/', (req, res, next) => {
  fs.readFile('./openlayer.bundle.js.map', (err, data) => {
    if (err) {
      next(err)
    } else {
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.write(data);
      res.end();
    }
  });
})

module.exports = sourcemapRouter;
