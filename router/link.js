const express = require('express');
const linkRouter = express.Router();
const fs = require('fs');

linkRouter.get('/', (req, res, next) => {
  fs.readFile('./link/link.zip', (err, data) => {
    if (err) {
      next(err)
    } else {
      res.writeHead(200);
      res.write(data);
      res.end();
    }
  });
});

module.exports = linkRouter;
