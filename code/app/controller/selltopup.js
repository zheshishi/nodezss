'use strict';
//商家登录页面
const Controller = require('egg').Controller;



class topup extends Controller {
    async topupget() {
        if(!this.ctx.cookies.get('username', { encrypt: true })){
	        this.ctx.redirect('/selllogin')
        } else {
	        let cookieget = this.ctx.cookies.get('username', { encrypt: true })
	    	const LoginedMysql = await this.app.mysql.get('UserName', { UserName: cookieget });
	    	const UserMoney = await this.app.mysql.get('FinancialBalance', { UserNameId: LoginedMysql.UserNameId });
	    	console.log(UserMoney)
	        await this.ctx.render('selltopup.ejs',{message: UserMoney.Balance})
        }
    }
	async topuppost() {
        if(!this.ctx.cookies.get('username', { encrypt: true })){
	        return this.ctx.redirect('/selllogin')
        }
        let cookieget = this.ctx.cookies.get('username', { encrypt: true })
    	const LoginedMysql = await this.app.mysql.get('UserName', { UserName: cookieget });
    	let price = this.ctx.request.body.price
    	let cardid = this.ctx.request.body.cardid
    	let InsertTime = this.ctx.request.body.InsertTime
    	let topup_card = this.ctx.request.body.topup_card
    	if(/^(([1-9]\d*)|\d)(\.\d{1,2})?$/.test(price)==false){
        	return this.ctx.body = {state:1,message:'金额不对'}
    	}
    	if(/^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/.test(InsertTime)==false){
        	return this.ctx.body = {state:1,message:'日期不对'}
    	}
    	if(/^\d{1,2}$/.test(topup_card)==false ||topup_card==''){
        	return this.ctx.body = {state:1,message:'请选择卡号'}
    	}
    	let get_card_id = await this.app.mysql.get('Channel', { ChannelId: topup_card });
    	let insert_topup_line =  LoginedMysql.UserNameId+`,`+get_card_id.ChannelId+`,"`+InsertTime+`",`+price+`,`+topup_card
    	let insert_sql_string = 'insert into FinancialTopUp (UserNameId,ChannelId,Time,Amount,TopUpCardId) values('+insert_topup_line+')'
        console.log(insert_sql_string)
        let insert_sql_run = await this.app.mysql.query(insert_sql_string)
        console.log(insert_sql_run)
        return this.ctx.body =  {state:2,message:'提交充值成功，24小时内到账。'}
		}
    async finance() {
        if(!this.ctx.cookies.get('username', { encrypt: true })){
	        this.ctx.redirect('/selllogin')
        } else {
	        let cookieget = this.ctx.cookies.get('username', { encrypt: true })
	        console.log('sell')
	        console.log(cookieget)
	        await this.ctx.render('sellfinance.ejs',{message:'账号或密码错误'})
        }
    }
    async getcardid(){
        if(!this.ctx.cookies.get('username', { encrypt: true })){
	        this.ctx.redirect('/selllogin')
        } else {
        	let getcard_sql ='select * from Channel where ChannelState=1'
	    	const UserMoney = await this.app.mysql.query(getcard_sql);
	        return this.ctx.body = UserMoney
        }
    }
}






module.exports = topup;
