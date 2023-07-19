const express = require('express');
const http = require('http');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const port = 4000;//포트번호

app.use(express.static('./'));

app.get('/Tile/:z/:y/:x', (req, res) => {
  const { x, y, z } = req.params;
  const url = `/Base/${z}/${y}/${x}`;
  fs.readFile(__dirname + url, (err, data) => {
    if (err) {
      res.status(404);
      res.send(err.message);
    } else {
      res.writeHead(200);
      res.write(data);
      res.end();
    }
  });
});

app.get('/openlayer', (req, res, next) => {
  fs.readFile(__dirname + '/openlayer.js', (err, data) => {
    if (err) {
      next(err)
    } else {
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.write(data);
      res.end();
    }
  });
});

/* 에러처리파트*/
app.use((req, res, next) => {
  const err = new Error('파일 경로 오류 : 해당 파일을 찾지 못했습니다.');
  err.status = 404;
  next(err);
});
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  if (err.status == 404) {
  }
  else {
    console.log(err.message)
  }
  res.send(err.message);
});

/* 서버 가동  localhost:(port)/ */
server.listen(port, () => {
  console.log(port + '포트로 서버 실행');
});

process.on('uncaughtException', (err) => {
  console.error('Error! = ', err);
});
