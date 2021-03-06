("use strict");
const Controller = require('egg').Controller;
var QcloudSms = require("qcloudsms_js");
var appid = 1400172261;  // SDK AppID是1400开头
var appkey = "16ad07643df4d5b614c5afac9ba0f566"
var phoneNumbers;
var qcloudsms = QcloudSms(appid, appkey);
function callback(err, res, resData) {
    if (err) {
        console.log("err: ", err);
    } else {
        console.log("request data: ", res.req);
        console.log("response data: ", resData);
    }
}

var ssender = qcloudsms.SmsSingleSender();
var params = ["5678"];
var templateId = 249169;
var SmsSign = "折试试";
let IHuyi = require("ihuyi106");
let account = "cf_vanxv";
let password = "1q2w3e4r";
let apiKey = "2a8f2e7f44351729a9ba6502e6750b76"; // international api key, if exist
let contentRandom="";
let contentRandom_array =[]
// apiKey is optional
let iHuyi = new IHuyi(account, password, apiKey);

module.exports = app => {
    class Home1Controller extends app.Controller {
      async index() {
        // --- send sms --- //
        let mobile_number;
        let contentRandom="";
        contentRandom_array =[];
        for(var i=0;i<6;i++){
          contentRandom+=Math.floor(Math.random()*10)
        }
        contentRandom_array.push(contentRandom)
        let content = "您正在进行手机验证，验证码是【 "+contentRandom+" 】，【 2 】分钟内有效。";
        console.log(this.ctx.request.body.username)
        console.log(contentRandom)
        ssender.sendWithParam(86, this.ctx.request.body.username, templateId, contentRandom_array, SmsSign, "", "", callback);
        //iHuyI SEND
        // iHuyi.send(this.ctx.request.body.username, content, function(err, smsId) {
        // if(err) {
        //     console.log(err.message);
        // } else {
        //     console.log("SMS sent, and smsId is " + contentRandom);
        //    }})
        //   this.ctx.body = {message:'yes'};
        // --- send sms --- //
        await this.app.mysql.insert('sms',{Verify: contentRandom, MobileNumber: parseInt(this.ctx.request.body.username) } );
        return this.ctx.body = {message:'yes'}
      }
    }
    return Home1Controller;
};


// class Home1Controller extends Controller {
//   async index() {
//     let number = this.ctx.request.username
//     console.log('this.ctx: '+this.ctx)
//     console.log(this.ctx)
//     console.log('this.ctx.request: '+this.ctx.request)
//     console.log(this.ctx.request)
//     console.log('this.ctx.request.username:'+this.ctx.request.username)
//     console.log(this.ctx.request.username)
//   	await this.app.mysql.insert('sms',{Verify: contentRandom, MobileNumber: parseInt(number) } );
//     iHuyi.send(number, content, function(err, smsId) {
//     if(err) {
//         console.log(err.message);
//         console.log(this.ctx)
//         this.ctx.body = {message:'no'}

//     } else {
//         iMobile = smsId
//         console.log("SMS sent, and smsId is " + smsId);
//         this.ctx.body = {message:'yes'}
//     }
//     })
//     //await this.app.mysql.insert('sms',{mobile:mobile, Verify:contentRandom});
//   }
// }

//module.exports = Home1Controller;
