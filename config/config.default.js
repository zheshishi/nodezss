'use strict';
const path = require('path');
var weburl = require("./weburl")

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1536142102057_2341';
  config.webUrl = "http:"+weburl+":7001";
  config.security = {
    csrf: {
      enable: false,
    },
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
