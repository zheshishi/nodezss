("use strict");


const Controller = require('egg').Controller;
let IHuyi = require("ihuyi106");
let account = "cf_vanxv";
let password = "1q2w3e4r";
let apiKey = "2a8f2e7f44351729a9ba6502e6750b76"; // international api key, if exist
let iCountryCode = "1";
let contentRandom = parseInt(Math.random().toString().slice(-6))
let content = "您正在进行手机验证，验证码是【 "+contentRandom+" 】，【 2 】分钟内有效。";
// apiKey is optional
let iHuyi = new IHuyi(account, password, apiKey);

module.exports = app => {
    class Home1Controller extends app.Controller {
      async index() {
        // --- send sms --- //
        // iHuyi.send(this.ctx.request.body.username, content, function(err, smsId) {
        // if(err) {
        //     console.log(err.message);
        // } else {
        //     console.log("SMS sent, and smsId is " + contentRandom);
        //    }})
        //   this.ctx.body = {message:'yes'};
        // --- send sms --- //
        console.log('sendSms：'+contentRandom)
        console.log(this.ctx.request.body.username)
        await this.app.mysql.insert('sms',{Verify: contentRandom, MobileNumber: parseInt(this.ctx.request.body.username) } );
        console.log('sendSms')


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
