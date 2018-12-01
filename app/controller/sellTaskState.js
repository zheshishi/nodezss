'use strict';

const Controller = require('egg').Controller;

async function AddRedis(app,key,min){
    // var now = new Date();
    // now =now.addMinutes(60*40);
    app.redis.set(key,key,'EX',min)
}

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
        //comment
        if(GetTaskId[0].TaskCommentId!==null){
            var ChangeCommentSql = 'update BuyTaskComment SET TaskCommentId=2 where BuyTaskComment = '+GetTaskId[0].TaskCommentId
            var ChangeComment =  await app.mysql.query(ChangeOrderSql); //获取订单，按订单时间排序获取
        }
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


    async genratetask(){

        //state 0：not login
        //state 1：没有账号
        //状态2: 不能下单
        //状态3: 生成订单
        //console.log('genratetask')
        if(this.ctx.request.body.headers.Authorization ==='' || this.ctx.request.body.headers.Authorization ===null ){
            return this.ctx.body = {status: 0, message: '没有token'}
        }
        var tokenVerify = this.app.jwt.verify(this.ctx.request.body.headers.Authorization, this.app.config.jwt.secret);
        var username = await this.app.mysql.get('UserName',{UserName:tokenVerify.username})//用户信息
        if(username ===null ){
            console.log('noToken')
            return this.ctx.body = {status: 0, message: '没有token'}
        }
        var orderid = this.ctx.request.body.headers.orderid //订单id
        await this.app.config.resql(orderid)
        //判断是否绑定账号
        var productGetDetailsSql = 'SELECT * FROM SellOrder JOIN SellProduct ON SellProduct.SellProductId = SellOrder.SellProductId WHERE SellOrderId = '+orderid+';'
        var productGetDetails = await this.app.mysql.query(productGetDetailsSql)
        var judgePlatformUser
        if(productGetDetails[0].orderNumber<1){
            return this.ctx.body={status:2,message:'订单被抢完啦，手快有手慢无'}
        }
        console.log('productGetDetails.ShopSort:'+productGetDetails[0].ShopSort)
        if(productGetDetails[0].ShopSort==='taobao' || productGetDetails[0].ShopSort==='tmall' || productGetDetails[0].ShopSort==='1688'){
            judgePlatformUser = await this.app.mysql.get('UserAccount',{UserNameId:username.UserNameId,PlatForm:'tb'})
            if(judgePlatformUser.length===0){
                return this.ctx.body = {status:1,message:'tb请绑定账号'}
            }
        }else if(productGetDetails[0].ShopSort==='jd'){
            judgePlatformUser = await this.app.mysql.get('UserAccount',{UserNameId:username.UserNameId,PlatForm:'jd'})
            if(judgePlatformUser.length===0){
                return this.ctx.body = {status:1,message:'jd请绑定账号'}
            }
        }
        //判断是否绑定账号

        //version:系统版本
        //sort:分类
        //思考如果是新用户是否免费送
        if(this.ctx.request.body.headers.version ==='1.0'){
            //店铺40天内是否做过？
            var sqlsyn = 'SELECT * FROM SellOrder WHERE SellOrderId = '+ orderid +' and SellOrder.SellShopId IN (SELECT SellOrder.sellShopId FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = BuyTask.SellOrderId WHERE buyUserNameId='+username.UserNameId+' AND BuyTaskState <> 0 AND  NOW() - INTERVAL 40 DAY < BuyTaskCreateTime);'
            var BuyShop = await this.app.mysql.query(sqlsyn) //如果存在数据，那么做过这家店铺
            if(BuyShop.length>0){
                return this.ctx.body = {status: 2, message: '该店铺不能下单'}
            }
            //店铺
            var sqluservalue = 'SELECT * FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = '+orderid+' WHERE buyUserNameId='+ username.UserNameId +' AND BuyTaskState <> 0'
            //搜下网站订单
            //确定他的账户是否绑定
            var BuyTask = await this.app.mysql.query(sqluservalue) //之前是否做过这个产品，
            var judgeRebuy = 0
            if(BuyTask.length>0) {
                //查看复购率是否大于30%
                if (productGetDetails[0].productBuy1 > 3) {
                    if (productGetDetails[0].productBuy2 / productGetDetails[0].productBuy1 > 0.3) {
                        judgeRebuy = 1
                    }
                }
            }
            if(judgeRebuy === 1){
                return this.ctx.body = {status:2,message:'不能下单'}
            }else if(judgeRebuy === 0){
                //judge user task state = 2
                let clickTask2Sql = 'SELECT * FROM BuyTask WHERE buyUserNameId='+ username.UserNameId +' AND BuyTaskState = 2'
                let clickTaskQuery = await this.app.mysql.query(clickTask2Sql) //插入任务
                if(clickTaskQuery.length>0){
                    let getTaskQuery = await CloseTaskId(this.app,clickTaskQuery[0].BuyTaskId,username.UserNameId,null)
                }
                //写下单的流程
                //任务金额计算 + 总金额计算 + 图片数 + 账号费 + 附加佣金
                let TaskAddMoney = productGetDetails[0].AddCoupons + productGetDetails[0].AddOpenOtherProduct + productGetDetails[0].AddSaveShop + productGetDetails[0].AddOpenProduct + productGetDetails[0].AddShoppingCar + productGetDetails[0].AddChat + productGetDetails[0].AddCommandsLike
                let id_money = productGetDetails[0].huabeiId * 2
                let task_total_money = productGetDetails[0].buyPrice * productGetDetails[0].buyNum
                //TaskAddMoney = 附加任务集合
                //idmoney = 账号数
                //imageNumber = 图片张数
                let MyDate = new Date();

                let CreateTaskSql = 'INSERT into BuyTask(buyUserNameId,SellOrderId,BuyTaskState,UserAccountId,PayMoney,AddMoney,AutoChangeState,AutoChangeTime)values('+username.UserNameId+','+orderid+',2,'+judgePlatformUser.UserAccountId+','+task_total_money+','+TaskAddMoney+',0,"'+MyDate.toMysqlFormat()+'"+ INTERVAL 40 Minute'+');'
                let BuyTask = await this.app.mysql.query(CreateTaskSql) //插入任务
                let OrderReduceSql = 'update SellOrder SET orderNumber=orderNumber-1 where SellOrderId = '+orderid
                let OrderReduceSqlx = await this.app.mysql.query(OrderReduceSql) //减少任务
                if(BuyTask.affectedRows===1){
                    //redis 设置倒计时
                    let redisReturn =await AddRedis(this.app,BuyTask.insertId,40*60)
                    //
                    // let message_obj = {
                    //     message: BuyTask.insertId,
                    //     func_name: 'taskstate2',
                    //     timeout: 2100
                    // }
                    // let key = JSON.stringify(message_obj);
                    // let content = "";
                    // console.log('raids key')
                    // console.log(key)
                    // this.app.redis.multi()
                    //     .set(key, content)
                    //     .expire(key, 2100)
                    //     .exec((error) => {
                    //         if (error) {
                    //             console.log("任务添加失败");
                    //         } else {
                    //             console.log("任务添加成功")
                    //         }
                    //     });
                    //关闭之前在做的订单
                    return this.ctx.body = {status:3,message:'下单成功，跳到订单任务区',taskId:BuyTask.insertId}

                }else{
                    return this.ctx.body = {status:4,message:'下单失败请重试，或联系管理员'}
                }
            }
        }
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
            let MyDate = new Date();
            MyDate = '"'+MyDate.toMysqlFormat()+ '"INTERVAL 40 Minute'
            var TaskStateSql = 'update BuyTask SET AutoChangeState=5,AutoChangeTime='+MyDate+', BuyTaskState=3,AddMoney='+ AddMoney +',PayMoney='+ PayMoney +',TaskScreen1='+ filesurl +',PlatFormOrderId='+ PlatFormOrderId + ' where BuyUserNameId='+ username.UserNameId +' and BuyTaskId='+ this.ctx.request.body.headers.TaskId +';'
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
        var filesurl = JSON.stringify(this.ctx.request.body.headers.filesurl)
        taskId = taskId[0]
        if(taskId===null || taskId.BuyUserNameId!==username.UserNameId || taskId.BuyTaskState!==this.ctx.request.body.headers.TaskState){
            return this.ctx.body = {status:1,message:'未知错误'}
        }
        if(taskId.BuyTaskState==5||taskId.BuyTaskState==6||taskId.BuyTaskState==7){
            //如果状态2就到3吗？
            console.log(filesurl)
            var TaskStateSql = 'update BuyTask SET BuyTaskState=6,TaskScreen2='+ filesurl +' where BuyUserNameId='+ username.UserNameId +' and BuyTaskId='+ this.ctx.request.body.headers.TaskId +';'
            var TaskState = await this.app.mysql.query(TaskStateSql); //获取订单，按订单时间排序获取
            if(TaskState){
                return this.ctx.body = {status:2,message:'提交成功'}
            }
        }
        return this.ctx.body = {username:'TaskState'}
    }
    //判断是否有评价，如果有则升级评价
    async SellTaskState3Verify() {
        console.log('SellTaskState3Verify：'+this.ctx.query.id)
        if (!this.ctx.cookies.get('username', {encrypt: true})) {
            return this.ctx.redirect('/selllogin')
        }
        let CookieUserName = this.ctx.cookies.get('username', {encrypt: true})
        let UserName = await this.app.mysql.get('UserName', {UserName: CookieUserName})
        let BuyTask = await this.app.mysql.query('select * from BuyTask JOIN SellOrder ON BuyTask.SellOrderId=SellOrder.SellOrderId JOIN SellProduct ON SellProduct.SellProductId=SellOrder.SellProductId where BuyTaskId='+this.ctx.query.id)
        BuyTask = BuyTask[0]
        let get_comment_sql = 'select * from BuyTaskComment WHERE TaskCommentState = 2 AND BuyTask.BuyTaskId='+BuyTask.SellProductId
        let get_comment = await this.app.mysql.query(get_comment_sql)
        let State3VerifySqlString;
        if(get_comment.length>0){
            State3VerifySqlString = 'UPDATE BuyTask JOIN SellOrder ON BuyTask.SellOrderId=SellOrder.SellOrderId JOIN SellProduct ON SellProduct.SellProductId=SellOrder.SellProductId  SET BuyTask.BuyTaskState=5,BuyTask.TaskCommentId='+get_comment[0].TaskCommentId +' WHERE BuyTask.BuyTaskState in (3,4) AND SellOrder.UserNameId='+ UserName.UserNameId +' AND BuyTask.BuyTaskId='+this.ctx.query.id+';'
            let get_comment_state_3 = 'UPDATE BuyTaskComment SET TaskCommentState=3 WHERE BuyTask.TaskCommentId='+get_comment[0].TaskCommentId
            let get_comment = await this.app.mysql.query(get_comment_state_3)
        }else{
            State3VerifySqlString = 'UPDATE BuyTask JOIN SellOrder ON BuyTask.SellOrderId=SellOrder.SellOrderId SET BuyTask.BuyTaskState=5 WHERE BuyTask.BuyTaskState in (3,4) AND SellOrder.UserNameId='+ UserName.UserNameId +' AND BuyTask.BuyTaskId='+this.ctx.query.id+';'
        }
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
        let BuyTask = await this.app.mysql.get('BuyTask', {BuyTaskId: this.ctx.query.id})
        let CloseTaskId = await CloseTaskId(this.app,this.ctx.query.id,UserName,'')
        //let State3VerifySqlString = 'UPDATE BuyTask JOIN SellOrder ON BuyTask.SellOrderId=SellOrder.SellOrderId SET BuyTask.BuyTaskState=0 WHERE BuyTask.BuyTaskState in (3,4,5,6,7) AND SellOrder.UserNameId='+ UserName.UserNameId +' AND BuyTask.BuyTaskId='+this.ctx.query.id+';'
        //let State3VerifySql = await this.app.mysql.query(State3VerifySqlString)
        console.log(CloseTaskId)
        return this.ctx.body=1
    }
}

module.exports = sellTaskState;
