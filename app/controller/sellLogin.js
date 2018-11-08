'use strict';
//商家登录页面
const Controller = require('egg').Controller;


class HomeController extends Controller {
    async sellLoginGet() {
        if(!this.ctx.cookies.get('username', { encrypt: true })){
	        await this.ctx.render('sellLogin.ejs',{message:''})
        } else {
        	this.ctx.redirect('/sell')
        }
        //this.ctx.body = 'hi, egg';
    }
	async sellLoginPost() {
	    console.log(this.ctx.request.body.username, this.ctx.request.body.password)
	    const LoginedMysql = await this.app.mysql.get('UserName', { UserName: this.ctx.request.body.username, PassWord: this.ctx.request.body.password });
	    if (LoginedMysql === null){
	        await this.ctx.render('sellLogin.ejs',{message:'账号或密码错误'})
	    } else  {
            this.ctx.cookies.set('username', this.ctx.request.body.username, { encrypt: true });
        	this.ctx.redirect('/sell')
	    }
	}
    async sellMobileLoginGet() {
        if(!this.ctx.cookies.get('username', { encrypt: true })){
	        await this.ctx.render('sellMobileLogin.ejs',{message:''})
        } else {
        	this.ctx.redirect('/sell')
        }
        //this.ctx.body = 'hi, egg';
    }
	async sellMobileLoginPost() {
	    //console.log(this.ctx.request.body.username)
	    //console.log(this.ctx.request.body.password)
	    //console.log(this.ctx.request.body.VerifyCode)
		const LoginedMysql = await this.app.mysql.select('sms', { where:{MobileNumber: this.ctx.request.body.username }});//是否存在验证码
		if (LoginedMysql.length === 0){
	        await this.ctx.render('sellMobileLogin.ejs',{message:'请发验证码'})
		} else  {
		    if (LoginedMysql[LoginedMysql.length -1].Verify !== parseInt(this.ctx.request.body.VerifyCode)) {
	        	await this.ctx.render('sellMobileLogin.ejs',{message:'验证码错误'})//验证码是否正确
		    } else if(LoginedMysql[LoginedMysql.length -1].MobileNumber !==this.ctx.request.body.username){
                await this.ctx.render('sellMobileLogin.ejs',{message:'手机号不一致'})//验证码是否正确
            }else {
		    // save mobile and password 保存密码
                const GetId = await this.app.mysql.get('UserName',{UserName: LoginedMysql[LoginedMysql.length -1].MobileNumber})
                if (GetId === null){
                    const row = {
                        UserName: LoginedMysql[LoginedMysql.length -1].MobileNumber,
                        PassWord: this.ctx.request.body.password
                    }
                    const createUser = await this.app.mysql.insert('UserName',row)
                    const GetNewUserId = await this.app.mysql.get('UserName',{UserName: LoginedMysql[LoginedMysql.length -1].MobileNumber})
                    const rowx = {
                        UserNameId: GetNewUserId.ID,
                        Balance: 0
                    }
                    const createUserB = await this.app.mysql.insert('FinancialBalance',rowx)
                    this.ctx.cookies.set('username', LoginedMysql[LoginedMysql.length -1].MobileNumber, { encrypt: true });
                    this.ctx.redirect('/sell')
				} else {
					var rowsql = "UPDATE UserName SET PassWord="+this.ctx.request.body.password+" WHERE ID="+GetId.ID+";"
					var result = await this.app.mysql.query(rowsql);
					if (result.affectedRows === 1) {
						this.ctx.cookies.set('username', LoginedMysql[LoginedMysql.length -1].MobileNumber, { encrypt: true });
						this.ctx.redirect('/sell')
					} else {
						await this.ctx.render('sellMobileLogin.ejs',{message:'密码更新错误，请联系管理员'})
				}
                }
		    }
		}

	}
}

module.exports = HomeController;
