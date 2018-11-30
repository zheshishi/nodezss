'use strict';

const Controller = require('egg').Controller;

async function CloseTaskId(app,taskId,UserNameId,CloseReason){
    //1. search taskId
    //2. closeid
    //3. add orderid
    var GetTaskId
    var GetTaskIdsql
    await app.config.resql(UserNameId)
    await app.config.resql(taskId)
    await app.config.resql(CloseReason)
    GetTaskIdsql = 'select * FROM BuyTask WHERE BuyTaskId='+taskId+' AND BuyUserNameId= '+UserNameId
    GetTaskId = await app.mysql.query(GetTaskIdsql)
    if(GetTaskId.length==0){
        GetTaskIdsql = 'select * FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = BuyTask.SellOrderId WHERE BuyTaskId='+taskId+' AND SellOrder.UserNameId= '+UserNameId
        GetTaskId = await app.mysql.query(GetTaskIdsql)
        }
    if(GetTaskId.length>0){
        var productGetDetailsSql = 'update BuyTask SET BuyTaskState=0, AutoChangeState=NULL,AutoChangeTime=NULL,CloseUserNameId='+UserNameId+',CloseReason='+CloseReason+' where BuyTaskId='+ taskId +';'
        var productGetDetails =  await app.mysql.query(productGetDetailsSql); //获取订单，按订单时间排序获取
        var ChangeOrderSql = 'update SellOrder SET orderNumber=orderNumber+1 where SellOrderId = '+GetTaskId[0].SellOrderId
        var ChangeOrder =  await app.mysql.query(ChangeOrderSql); //获取订单，按订单时间排序获取
        console.log('ChangeOrder')
        return ChangeOrder
    }
}

function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};


class sellTaskState extends Controller {
    //Buyer TaskState 2\3\4->3


        async closetask() {
            //console.log('closetask: this.ctx.header:'+this.ctx.header)
            if(this.ctx.header.authorization ==='' || this.ctx.header.authorization ===null ){
                //console.log('noToken')
                return this.ctx.body = {username:'username'}
            }
            var tokenVerify = this.app.jwt.verify(this.ctx.header.authorization, this.app.config.jwt.secret);
            var username = await this.app.mysql.get('UserName',{UserName:tokenVerify.username});
            var taskId = this.ctx.header.taskid
            let getTask = await CloseTaskId(this.app,taskId,username.UserNameId,null)
            return this.ctx.body = {state:1,message:'done'}
        }

    async MobileTaskState3(){
        /*state0:需登录
          state1:错误提醒
          state2:成功
         */
        //Regular
        var rePayMoney = /^([1-5]\d{0,9}|0)([.]?|(\.\d{1,2})?)$/
        var reOrderId = /^([1-9]\d{1,30})/
        var reAddMoney = /^([1-9]\d{0,1})$/
        if(this.ctx.request.body.headers.Authorization ==='' || this.ctx.request.body.headers.Authorization ===null ){
            console.log('noToken')
            return this.ctx.body = {status:0,message:'未知错误'}
        }
        var tokenVerify = this.app.jwt.verify(this.ctx.request.body.headers.Authorization, this.app.config.jwt.secret);
        var username = await this.app.mysql.get('UserName',{UserName:tokenVerify.username})//用户信息
        var taskIdSql = 'SELECT * FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = BuyTask.SellOrderId WHERE BuyTaskId='+this.ctx.request.body.headers.TaskId
        var taskId = await this.app.mysql.query(taskIdSql)
        taskId = taskId[0]
        if(taskId===null || taskId.BuyUserNameId!==username.UserNameId || taskId.BuyTaskState!==this.ctx.request.body.headers.TaskState){
            return this.ctx.body = {status:1,message:'未知错误'}
        }
        if(taskId.BuyTaskState==2||taskId.BuyTaskState==3||taskId.BuyTaskState==4){
            var PayMoney = parseFloat(this.ctx.request.body.headers.PayMoney)
            var AddMoney = parseFloat(this.ctx.request.body.headers.AddMoney)
            var filesurl = JSON.stringify(this.ctx.request.body.headers.filesurl)
            var PlatFormOrderId = parseInt(this.ctx.request.body.headers.PlatFormOrderId)
            if(reOrderId.test(PlatFormOrderId) ===false||rePayMoney.test(PayMoney) ===false ||reAddMoney.test(AddMoney) ===false){
                return this.ctx.body = {status:1,message:'金额格式、订单编号不对'}
            }
            if((PayMoney - (taskId.buyNum * taskId.buyPrice))>50||AddMoney>20||PayMoney<1||AddMoney<0){
                return this.ctx.body = {status:1,message:'订单修改金额不能>50，附加任务不能>20'}
            }
            //如果状态2就到3吗？
            console.log(filesurl)
            var TaskStateSql = 'update BuyTask SET BuyTaskState=3,AddMoney='+ AddMoney +',PayMoney='+ PayMoney +',TaskScreen1='+ filesurl +',PlatFormOrderId='+ PlatFormOrderId + ' where BuyUserNameId='+ username.UserNameId +' and BuyTaskId='+ this.ctx.request.body.headers.TaskId +';'
            var TaskState = await this.app.mysql.query(TaskStateSql); //获取订单，按订单时间排序获取
            if(TaskState){
                return this.ctx.body = {status:2,message:'提交成功'}
            }
        }
        return this.ctx.body = {username:'TaskState'}
    }

    async MobileTaskState6(){
        /*state0:需登录
          state1:错误提醒
          state2:成功
         */
        //Regular
        var rePayMoney = /^([1-5]\d{0,9}|0)([.]?|(\.\d{1,2})?)$/
        var reOrderId = /^([1-9]\d{1,30})/
        var reAddMoney = /^([1-9]\d{0,1})$/
        if(this.ctx.request.body.headers.Authorization ==='' || this.ctx.request.body.headers.Authorization ===null ){
            console.log('noToken')
            return this.ctx.body = {status:0,message:'未知错误'}
        }
        var tokenVerify = this.app.jwt.verify(this.ctx.request.body.headers.Authorization, this.app.config.jwt.secret);
        var username = await this.app.mysql.get('UserName',{UserName:tokenVerify.username})//用户信息
        var taskIdSql = 'SELECT * FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = BuyTask.SellOrderId WHERE BuyTaskId='+this.ctx.request.body.headers.TaskId
        var taskId = await this.app.mysql.query(taskIdSql)
        taskId = taskId[0]
        if(taskId===null || taskId.BuyUserNameId!==username.UserNameId || taskId.BuyTaskState!==this.ctx.request.body.headers.TaskState){
            return this.ctx.body = {status:1,message:'未知错误'}
        }
        if(taskId.BuyTaskState==5||taskId.BuyTaskState==6||taskId.BuyTaskState==7){
            //如果状态2就到3吗？
            console.log(filesurl)
            var TaskStateSql = 'update BuyTask SET BuyTaskState=6 where BuyUserNameId='+ username.UserNameId +' and BuyTaskId='+ this.ctx.request.body.headers.TaskId +';'
            var TaskState = await this.app.mysql.query(TaskStateSql); //获取订单，按订单时间排序获取
            if(TaskState){
                return this.ctx.body = {status:2,message:'提交成功'}
            }
        }
        return this.ctx.body = {username:'TaskState'}
    }

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
        let State6VerifySql = await this.app.mysql.query(State6VerifySqlString)
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
