'use strict';
const qiniu = require('qiniu');
const { getRandomNum } = require('../utils');
const assert = require('assert');
class Qiniu {
  constructor(app) {
    console.log('test_insert_qiniu')
    this.option = app.config.qiniu;
    this.mac = new qiniu.auth.digest.Mac(app.config.qiniu.ak, app.config.qiniu.sk);
    this.config = new qiniu.conf.Config();
    this.config.zone = qiniu.zone[app.config.qiniu.zone];
  }

  async createToken() {
    console.log('test_insert_createToken')
    const options = {
      scope: `${this.option.bucket}`,
      expires: 20 * 60,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(this.mac);
    return uploadToken
  }
  async upload() {
      console.log('test_insert_upload')
      const options = {
          scope: `${this.option.bucket}`,
          expires: 20 * 60,
      };
      const putPolicy = new qiniu.rs.PutPolicy(options);
      const uploadToken = putPolicy.uploadToken(this.mac);
      return uploadToken
  }
  async info(key) {
    const bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
    return new Promise((resolved, reject) => {
      bucketManager.stat(this.option.bucket, key, function(err, respBody, respInfo) {
        if (err) {
          reject(err);
        } else {
          if (respInfo.statusCode === 200) {
            resolved(respBody);
          } else {
            // throw respInfo.statusCode
            resolved(respBody);
          }
        }
      });
    });
  }
}
const mount = app => {
  const { qiniu: config } = app.config;
  assert(config.ak && config.sk, `[egg-qiniu-upload] ak: ${config.ak}, sk: ${config.sk}`);
  assert(config.bucket && config.baseUrl, `[egg-qiniu-upload] bucket: ${config.bucket}, baseUrl: ${config.baseUrl}`);
  assert(config.zone, `[egg-qiniu-upload] zone: ${config.zone}`);
  app.qiniu = new Qiniu(app);
};
module.exports = mount;
