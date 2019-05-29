'use strict';
//商家登录页面
const Controller = require('egg').Controller;
// const Cookies = require('egg-cookies');
// const cookies = new Cookies(this.ctx, keys);


class sellController extends Controller {
    async index() {
    	//console.log('/sell_index')
        if(!this.ctx.cookies.get('username', { encrypt: true })){
	        this.ctx.redirect('/selllogin')
        } else {
	        let cookieget = this.ctx.cookies.get('username', { encrypt: true })
        	this.ctx.redirect('/sell/createtask')
	        //await this.ctx.render('sell.ejs',{message:'账号或密码错误'})
        }
    }
	async sellPost() {
        //console.log(this.ctx.request.body.username, this.ctx.request.body.password)
	    const LoginedMysql = await this.app.mysql.get('UserName', { UserName: this.ctx.request.body.username, PassWord: this.ctx.request.body.password });
	    if (LoginedMysql === null){
	        await this.ctx.render('sellLogin.ejs',{message:'账号或密码错误',token:'', clearToken:0})
	    } else  {
	        const token = this.app.jwt.sign({ username: this.ctx.request.body.username, password: this.ctx.request.body.password }, this.app.config.jwt.secret);
	        const tokenVerify = this.app.jwt.verify(token, this.app.config.jwt.secret);
	        this.app.jwt.verify(token, '123456', function(err, decoded) {
	            console.log(err)
	        });
	        let returnlog = 'token:' + token + 'tokenVerify :'+ JSON.stringify(tokenVerify)
	        console.log(returnlog)
            await this.ctx.render('sellLogin.ejs',{message:'', token:token, clearToken:0});
	    }
	}
}

module.exports = sellController;
