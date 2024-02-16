const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const http = require('http');
const tileMapRouter = require('./router/tile');
const scriptRouter = require('./router/script');
const linkRouter = require('./router/link');
const sourcemapRouter = require('./router/sourcemap');
const compression = require('compression');
//const stylesheetRouter = require('./router/stylesheet');
const app = express();
const server = http.createServer(app);
const port = process.env.PORT;//포트번호

app.use(compression());
app.use(express.json());
app.use('/Tile', tileMapRouter);
app.use('/openlayer', scriptRouter);
app.use('/openlayer.bundle.js.map', sourcemapRouter);
//app.use('/olcss', stylesheetRouter);
app.use('/link', linkRouter);
app.use((req, res, next) => {//에러처리파트
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

server.listen(port, () => {//서버 가동  localhost:(port)
  console.log(port + '포트로 서버 실행');
});

process.on('uncaughtException', (err) => {
  console.error('Error! = ', err);
});
