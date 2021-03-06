'use strict';

// had enabled by egg
exports.static = true;
exports.mysql = {
  enable: true,
  package: 'egg-mysql',
};
exports.alinode = {
  enable: true,
  package: 'egg-alinode',
};
exports.jwt = {
    enable: true,
    package: "egg-jwt"
};
exports.qiniu = {
  enable: true,
  package: "egg-qiniu-upload"
};
exports.security = {
  xframe: {
    enable: false,
  },
};
exports.ejs = {
    enable: true,
    package: 'egg-view-ejs',
};
exports.session = true;

exports.redis = {
    enable: true,
    package: 'egg-redis',
};
