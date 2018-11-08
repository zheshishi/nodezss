'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
  	console.log(this.app)
  	console.log('this.mysql')
   //  const mysqlquery = await this.app.mysql.query('select * from UserName')
	  // const post = await this.app.mysql.get('UserName', { username: 'username' });
  	// const mysqlInsert = await this.app.mysql.insert('UserName',{UserName:'insert', PassWord:'password'});
  	// const insertSuccess = mysqlInsert.affectedRows ===1;
   // 	const mysqlresult = "mysqlget:" + mysqlquery;
    //this.ctx.body = mysqlquery[0]
  }
}

module.exports = HomeController;
