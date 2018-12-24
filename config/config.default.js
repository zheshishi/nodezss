'use strict';
const path = require('path');
var weburl = require("./weburl")
var resql = require('./resql')
var MoneyAlgorithm = require("./MoneyAlgorithm")
module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1536142102057_2341';
  config.webUrl = weburl;
  config.MoneyAlgorithm = MoneyAlgorithm;
  config.resql = resql;
  config.cluster = {
    listen: {
    port: 80,
    }
    };
  config.security = {
    csrf: {
      enable: false,
    },
  };
exports.alinode = {
  appid: '77679',
  secret: '011eb1fde12364efc0b1ff4ceb39de300394c3ec',
};
  // add your config here
  config.static = {
    prefix: '/public/',
    dir: path.join(appInfo.baseDir, 'app/public'),
    // support lazy load
    dynamic: true,
    preload: false,
    buffer: false,
    maxFiles: 1000,
    },
  config.qiniu = {
  // I ussually set the key into `~/.zshrc`, and I can get the value via `process.env.key`, It's very safe~
    ak: 'fjiEbz75c-y8-297Jsgyih7Qq05NIxXjprPl0hSw',
    sk: '089X4S0fLRMFRwb1Y3CyRcev6yhOtNH58Otr-BeR',
    bucket: 'crysystem',
    baseUrl: 'http://img.zhess.com',
    zone: 'z2',
    app: true, // default value
    agent: false, //default value
  },
  config.middleware = [];
  config.mysql = {
      // database configuration
      client: {
          host: weburl,
          port: '3306',
          user: 'root',
          password: '1121Mysql',
          database: 'CrySystem',
      },
      // load into app, default true
      app: true,
      // load into agent, default false
      agent: false
    },
  config.redis = {
      client: {
          port: 6379,
          host: weburl,
          password: '1121redis',
          db: 1,
      },
  },
  config.view = {
    mapping: {
      '.ejs': 'ejs',
    },
  };
  config.jwt = {
      secret: "1121"
  };
  return config;
};
