const path = require('path');
const express = require('express');
const webpack = require('webpack');
const request = require('request');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../webpack.config.js');
const app = express();
const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;

var proxy = require('express-http-proxy');

if (isDeveloping) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'client',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));

  var tcProxy = proxy('localhost:9000', {
    proxyReqPathResolver: function (req, res) {
      return '/catalyst/catalystws' + require('url').parse(req.url).path;
    }
  });
  app.use('/catalyst/catalystws', tcProxy);
  app.use('/catalyst', function response(req, res, next) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
} else {
  app.use(express.static(__dirname + '../dist'));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

//create express server on port 3000
app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.log("                                                                  ");
  console.log("     _________            jjj      aaaa    vvv        vvv    aaaa");
  console.log("    |  v   ^  |           jjj     aaaaaa    vvv      vvv    aaaaaa");
  console.log("    |  O - O  |           jjj    aaa  aaa    vvv    vvv    aaa  aaa");
  console.log("    |    v    |           jjj   aaaaaaaaaa    vvv  vvv    aaaaaaaaaa");
  console.log("    |      _  |    jjj    jjj   aaa    aaa     vvvvvv     aaa    aaa");
  console.log(" ___|         |___  jjjjjjjj    aaa    aaa      vvvv      aaa    aaa");
  console.log("|                 |");
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
