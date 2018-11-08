'use strict';
const path = require('path');

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1536142102057_2341';
  config.webUrl = "http://127.0.0.1:7001";
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
          host: '127.0.0.1',
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
          host: '127.0.0.1',
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
  config.webSettings = {
      url: "http://127.0.0.1:7001"
  };
  config.redis = {
        // your redis configurations
  };
  return config;
};
