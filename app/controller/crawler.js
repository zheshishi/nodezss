'use strict';
const Controller = require('egg').Controller;


class HomeController extends Controller {
  async index() {
      var alipayUsername = this.ctx.request.body.alipayUsername
      var paltform = this.ctx.request.body.paltform
      var getCookie = this.ctx.request.body.cookies
      var AlipayCertStatus = parseInt(this.ctx.request.body.AlipayCertStatus)
      var mysqlSql = await this.app.mysql.get('UserAccount',{PlatFormUserName: alipayUsername, PlatForm:paltform});
  	  if(mysqlSql===null){
          var Minset = await this.app.mysql.insert('UserAccount',{
              PlatFormUserName: this.ctx.request.body.alipayUsername,
              PlatForm:paltform,
              AlipayAccountCount:parseInt(this.ctx.request.body.AlipayAccountCount),
              AlipayCertName:this.ctx.request.body.AlipayCertName,
              AlipayCertNo:this.ctx.request.body.AlipayCertNo,
              AlipayCertStatus:AlipayCertStatus,
              AlipayCertType:this.ctx.request.body.AlipayCertType,
              MainId:this.ctx.request.body.MainId,
              alipayEmail:this.ctx.request.body.alipayEmail,
              alipayPhone:this.ctx.request.body.alipayPhone,
              alipayRegTime:this.ctx.request.body.alipayRegTime.replace('年','-').replace('月','-').replace('日','-'),
              cookie:JSON.stringify(this.ctx.request.body.cookies),
              UA:this.ctx.request.body.ua
          });
      }else{
  	      console.log('exist username')
      }
      //const mysqlInsert = await this.app.mysql.insert('UserName',{UserName:'insert', PassWord:'password'});

      //  const mysqlquery = await this.app.mysql.query('select * from UserName')
	  // const post = await this.app.mysql.get('UserName', { username: 'username' });
  	// const mysqlInsert = await this.app.mysql.insert('UserName',{UserName:'insert', PassWord:'password'});
  	// const insertSuccess = mysqlInsert.affectedRows ===1;
   // 	const mysqlresult = "mysqlget:" + mysqlquery;
    //this.ctx.body = mysqlquery[0]
  }
}

module.exports = HomeController;
