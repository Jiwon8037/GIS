const express = require('express');
const linkRouter = express.Router();
const fs = require('fs');

linkRouter.get('/', (req, res, next) => {
  fs.readFile('./Base/MOCT_LINK.json', (err, data) => {
    if (err) {
      next(err)
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8'});
      res.write(data);
      res.end();
    }
  });
});

module.exports = linkRouter;
