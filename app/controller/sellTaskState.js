'use strict';

const Controller = require('egg').Controller;

class sellTaskState extends Controller {
    async SellTaskState3Verify() {
        console.log('SellTaskState3Verify：'+this.ctx.query.id)
        if (!this.ctx.cookies.get('username', {encrypt: true})) {
            return this.ctx.redirect('/selllogin')
        }
        let CookieUserName = this.ctx.cookies.get('username', {encrypt: true})
        let UserName = await this.app.mysql.get('UserName', {UserName: CookieUserName})
        let State3VerifySqlString = 'UPDATE BuyTask JOIN SellOrder ON BuyTask.SellOrderId=SellOrder.SellOrderId SET BuyTask.BuyTaskState=5 WHERE  BuyTask.BuyTaskState in (3,4) AND SellOrder.UserNameId='+ UserName.UserNameId +' AND BuyTask.BuyTaskId='+this.ctx.query.id+';'
        let State3VerifySql = await this.app.mysql.query(State3VerifySqlString)
        console.log(State3VerifySql)
        return this.ctx.body=1
    }

    async SellTaskState6Verify(){
        console.log('SellTaskState6Verify：'+this.ctx.query.id)
        if (!this.ctx.cookies.get('username', {encrypt: true})) {
            return this.ctx.redirect('/selllogin')
        }
        let CookieUserName = this.ctx.cookies.get('username', {encrypt: true})
        let UserName = await this.app.mysql.get('UserName', {UserName: CookieUserName})
        let State6VerifySqlString = 'UPDATE BuyTask JOIN SellOrder ON BuyTask.SellOrderId=SellOrder.SellOrderId SET BuyTask.BuyTaskState=1 WHERE  BuyTask.BuyTaskState in (6,7) AND SellOrder.UserNameId='+ UserName.UserNameId +' AND BuyTask.BuyTaskId='+this.ctx.query.id+';'
        let State6VerifySql = await this.app.mysql.query(State3VerifySqlString)
        console.log(State6VerifySql)
        return this.ctx.body=1
    }
    async SellTaskState3Refuse(){
        console.log('SellTaskState3Refuse：'+this.ctx.query.id+'text:'+this.ctx.query.text)
        if (!this.ctx.cookies.get('username', {encrypt: true})) {
            return this.ctx.redirect('/selllogin')
        }
        let CookieUserName = this.ctx.cookies.get('username', {encrypt: true})
        let UserName = await this.app.mysql.get('UserName', {UserName: CookieUserName})
        let State3VerifySqlString = 'UPDATE BuyTask JOIN SellOrder ON BuyTask.SellOrderId=SellOrder.SellOrderId SET BuyTask.BuyTaskState=4 WHERE  BuyTask.BuyTaskState in (3,4) AND SellOrder.UserNameId='+ UserName.UserNameId +' AND BuyTask.BuyTaskId='+this.ctx.query.id+';'
        let State3VerifySql = await this.app.mysql.query(State3VerifySqlString)
        console.log(State3VerifySql)
        return this.ctx.body=1
    }
    async SellTaskState6Refuse(){
        console.log('SellTaskState6Refuse：'+this.ctx.query.id+'text:'+this.ctx.query.text)
        if (!this.ctx.cookies.get('username', {encrypt: true})) {
            return this.ctx.redirect('/selllogin')
        }
        let CookieUserName = this.ctx.cookies.get('username', {encrypt: true})
        let UserName = await this.app.mysql.get('UserName', {UserName: CookieUserName})
        let State3VerifySqlString = 'UPDATE BuyTask JOIN SellOrder ON BuyTask.SellOrderId=SellOrder.SellOrderId SET BuyTask.BuyTaskState=7 WHERE  BuyTask.BuyTaskState in (6,7) AND SellOrder.UserNameId='+ UserName.UserNameId +' AND BuyTask.BuyTaskId='+this.ctx.query.id+';'
        let State3VerifySql = await this.app.mysql.query(State3VerifySqlString)
        console.log(State3VerifySql)
        return this.ctx.body=1
    }
    async SellerCloseTask(){
        console.log('SellerCloseTask：'+this.ctx.query.id+'text:'+this.ctx.query.text)
        if (!this.ctx.cookies.get('username', {encrypt: true})) {
            return this.ctx.redirect('/selllogin')
        }
        let CookieUserName = this.ctx.cookies.get('username', {encrypt: true})
        let UserName = await this.app.mysql.get('UserName', {UserName: CookieUserName})
        let State3VerifySqlString = 'UPDATE BuyTask JOIN SellOrder ON BuyTask.SellOrderId=SellOrder.SellOrderId SET BuyTask.BuyTaskState=0 WHERE BuyTask.BuyTaskState in (3,4,5,6,7) AND SellOrder.UserNameId='+ UserName.UserNameId +' AND BuyTask.BuyTaskId='+this.ctx.query.id+';'
        let State3VerifySql = await this.app.mysql.query(State3VerifySqlString)
        console.log(State3VerifySql)
        return this.ctx.body=1
    }
}

module.exports = sellTaskState;
