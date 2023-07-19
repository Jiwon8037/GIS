const express = require('express');
const scriptRouter = express.Router();
const fs = require('fs');

scriptRouter.get('/', (req, res, next) => {
  fs.readFile('./openlayer.js', (err, data) => {
    if (err) {
      next(err)
    } else {
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.write(data);
      res.end();
    }
  });
});

module.exports = scriptRouter;
