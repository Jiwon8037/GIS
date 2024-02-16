const express = require('express');
const tileMapRouter = express.Router();
const fs = require('fs');

tileMapRouter.get('/:z/:y/:x', (req, res) => {
  const { x, y, z } = req.params;
  const url = `./Base/${z}/${y}/${x}`;
  fs.readFile(url, (err, data) => {
    if (err) {
      res.status(404);
      res.send(err.message);
    } else {
      res.writeHead(200, { 
        "Content-Type": "image/png", 
        "Cache-Control": "public, max-age=31536000, immutable" 
      });
      res.end(data);
    }
  });
});

module.exports = tileMapRouter;
