function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};


module.exports = app => {
    class mIndex extends app.Controller {
      //通过任务id和账号id关闭订单 access taskid and usernameid close task
        async TaskState(){
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
            if(taskId.BuyTaskState === 2){
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

      async GetBuyTask() {
            console.log('GetBuyTask')
            if(this.ctx.header.authorization ==='' || this.ctx.header.authorization ===null ){
                console.log('noToken')
                return this.ctx.body = {username:'username'}
                }

                console.log('verify Version and sort')
                //const token = this.app.jwt.sign({ username: this.ctx.request.body.username, password: this.ctx.request.body.password }, this.app.config.jwt.secret);
                const tokenVerify = this.app.jwt.verify(this.ctx.header.authorization, this.app.config.jwt.secret);
                var username = await this.app.mysql.get('UserName',{UserName:tokenVerify.username})//用户信息
                //拿到买家45天内买过的店铺名
                var BuyTaskSql = 'SELECT * FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = BuyTask.SellOrderId WHERE buyUserNameId='+ username.UserNameId +' AND BuyTaskState <> 0'
                var sqlsyn = 'SELECT * FROM SellOrder JOIN SellProduct ON SellOrder.SellProductId = SellProduct.SellProductId JOIN SellShop ON SellProduct.SellShopId = SellShop.SellShopId WHERE orderNumber>0 AND SellShop.SellShopId NOT IN (SELECT SellOrder.sellShopId FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = BuyTask.SellOrderId WHERE buyUserNameId='+username.UserNameId+' AND BuyTaskState <> 0 AND  NOW() - INTERVAL 40 DAY < BuyTaskCreateTime);'
                var sqluservalue = 'SELECT * FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = BuyTask.SellOrderId WHERE buyUserNameId='+ username.UserNameId +' AND BuyTaskState NOT IN(0,1)'
                //console.log(sqlsyn)
                var BuyOrder = await this.app.mysql.query(sqlsyn)
                var BuyTask = await this.app.mysql.query(sqluservalue)
                // 是否复购代码
                console.log('GetBuyTaskEnd')
                return this.ctx.body = BuyTask//返回：订单编号+产品主图
        }
        async GetBuyTaskDone() {
            console.log('GetBuyTask')
            if(this.ctx.header.authorization ==='' || this.ctx.header.authorization ===null ){
                console.log('noToken')
                return this.ctx.body = {username:'username'}
            }

            //const token = this.app.jwt.sign({ username: this.ctx.request.body.username, password: this.ctx.request.body.password }, this.app.config.jwt.secret);
            const tokenVerify = this.app.jwt.verify(this.ctx.header.authorization, this.app.config.jwt.secret);
            var username = await this.app.mysql.get('UserName',{UserName:tokenVerify.username})//用户信息
            //拿到买家45天内买过的店铺名
            var BuyTaskSql = 'SELECT * FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = BuyTask.SellOrderId WHERE buyUserNameId='+ username.UserNameId +' AND BuyTaskState <> 0'
            var sqlsyn = 'SELECT * FROM SellOrder JOIN SellProduct ON SellOrder.SellProductId = SellProduct.SellProductId JOIN SellShop ON SellProduct.SellShopId = SellShop.SellShopId WHERE orderNumber>0 AND SellShop.SellShopId NOT IN (SELECT SellOrder.sellShopId FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = BuyTask.SellOrderId WHERE buyUserNameId='+username.UserNameId+' AND BuyTaskState <> 0 AND  NOW() - INTERVAL 40 DAY < BuyTaskCreateTime);'
            var sqluservalue = 'SELECT * FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = BuyTask.SellOrderId WHERE buyUserNameId='+ username.UserNameId +' AND BuyTaskState =1'
            //console.log(sqlsyn)
            var BuyOrder = await this.app.mysql.query(sqlsyn)
            var BuyTask = await this.app.mysql.query(sqluservalue)
            // 是否复购代码
            console.log('GetBuyTaskEnd')
            return this.ctx.body = BuyTask//返回：订单编号+产品主图
        }
        async GetBuyTaskClose() {
            console.log('GetBuyTaskClose')
            if(this.ctx.header.authorization ==='' || this.ctx.header.authorization ===null ){
                console.log('noToken')
                return this.ctx.body = {username:'username'}
            }

            //const token = this.app.jwt.sign({ username: this.ctx.request.body.username, password: this.ctx.request.body.password }, this.app.config.jwt.secret);
            const tokenVerify = this.app.jwt.verify(this.ctx.header.authorization, this.app.config.jwt.secret);
            var username = await this.app.mysql.get('UserName',{UserName:tokenVerify.username})//用户信息
            //拿到买家45天内买过的店铺名
            var BuyTaskSql = 'SELECT * FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = BuyTask.SellOrderId WHERE buyUserNameId='+ username.UserNameId +' AND BuyTaskState <> 0'
            var sqlsyn = 'SELECT * FROM SellOrder JOIN SellProduct ON SellOrder.SellProductId = SellProduct.SellProductId JOIN SellShop ON SellProduct.SellShopId = SellShop.SellShopId WHERE orderNumber>0 AND SellShop.SellShopId NOT IN (SELECT SellOrder.sellShopId FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = BuyTask.SellOrderId WHERE buyUserNameId='+username.UserNameId+' AND BuyTaskState <> 0 AND  NOW() - INTERVAL 40 DAY < BuyTaskCreateTime);'
            var sqluservalue = 'SELECT * FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = BuyTask.SellOrderId WHERE buyUserNameId='+ username.UserNameId +' AND BuyTaskState =0'
            //console.log(sqlsyn)
            var BuyOrder = await this.app.mysql.query(sqlsyn)
            var BuyTask = await this.app.mysql.query(sqluservalue)
            // 是否复购代码
            console.log('GetBuyTaskEnd')
            return this.ctx.body = BuyTask//返回：订单编号+产品主图
        }


      async index() {
            console.log('MINDEX')
            if(this.ctx.header.authorization ==='' || this.ctx.header.authorization ===null ){
            	console.log('noToken')
	            return this.ctx.body = {username:'username'}
            	}
            //const token = this.app.jwt.sign({ username: this.ctx.request.body.username, password: this.ctx.request.body.password }, this.app.config.jwt.secret);
            const tokenVerify = this.app.jwt.verify(this.ctx.header.authorization, this.app.config.jwt.secret);
            var username = await this.app.mysql.get('UserName',{UserName:tokenVerify.username})//用户信息
            //拿到买家45天内买过的店铺名
            var sqlsyn = 'SELECT * FROM SellOrder JOIN SellProduct ON SellOrder.SellProductId = SellProduct.SellProductId JOIN SellShop ON SellProduct.SellShopId = SellShop.SellShopId WHERE orderNumber>0 AND event ='+ this.ctx.header.event+' AND SellShop.SellShopId  NOT IN (SELECT SellOrder.sellShopId FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = BuyTask.SellOrderId WHERE buyUserNameId='+username.UserNameId+' AND BuyTaskState <> 0 AND  NOW() - INTERVAL 40 DAY < BuyTaskCreateTime);'
            var sqluservalue = 'SELECT * FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = BuyTask.SellOrderId WHERE buyUserNameId='+ username.UserNameId +' AND BuyTaskState <> 0'
            console.log(sqlsyn)
            var BuyOrder = await this.app.mysql.query(sqlsyn)
            var BuyTask = await this.app.mysql.query(sqluservalue)
            //get 最近的任务
            // 订单赛选
            // 是否复购代码
            var AfterPurchase = 0
            var returnOrder = []
            for (var sx =0; sx<BuyOrder.length; sx++){
                for (var sxx =0; sxx<BuyTask.length; sxx++){
                    //console.log('sxx:'+sxx)
                    //console.log('BuyOrder[sx].SellProductId:'+BuyOrder[sx].SellProductId)
                    //console.log('BuyTask[sxx].SellProductId:'+BuyTask[sxx].SellProductId)
                    if(BuyOrder[sx].SellProductId ==  BuyTask[sxx].SellProductId){
                        if(BuyOrder[sx].ProductBuy1> 5){
                            if(BuyOrder[sx].ProductBuy2/BuyOrder[sx].ProductBuy1>0.3){//如果产品复购率>30%不展示
                                AfterPurchase = 1}
                            }
                        }
                    }
                if(AfterPurchase===1){
                    AfterPurchase=0
                }else{returnOrder.push(BuyOrder[sx])}
                }
            //去掉

                    // 是否复购代码
                    // 订单赛选
		            return this.ctx.body = returnOrder//返回：订单编号+产品主图
		            //this.ctx.body = {username:username}//返回：订单编号+产品主图
        	}

        async product() {
            console.log('product')
            if(this.ctx.header.authorization ==='' || this.ctx.header.authorization ===null ){
            	console.log('noToken')
	            return this.ctx.body = {username:'username'}
            	}
            	//version:系统版本
            	//sort:分类
            	//思考如果是新用户是否免费送

                //const token = this.app.jwt.sign({ username: this.ctx.request.body.username, password: this.ctx.request.body.password }, this.app.config.jwt.secret);
                var tokenVerify = this.app.jwt.verify(this.ctx.header.authorization, this.app.config.jwt.secret);
                var username = await this.app.mysql.get('UserName',{UserName:tokenVerify.username})//用户信息
                var taskId = this.ctx.header.taskid //用户信息
                //拿到买家40天内买过的店铺名
                var productGetDetailsSql = 'SELECT * FROM SellOrder JOIN SellProduct ON SellOrder.SellProductId = SellProduct.SellProductId JOIN SellShop ON SellProduct.SellShopId = SellShop.SellShopId WHERE SellOrderId ='+taskId+';'
                var productGetDetails = await this.app.mysql.query(productGetDetailsSql) //获取订单，按订单时间排序获取
                //console.log(productGetDetails [0])
                return this.ctx.body = productGetDetails[0]//返回：订单编号+产品主图
                //this.ctx.body = {username:username}//返回：订单编号+产品主图

    }

        async task() {
            //console.log('task: this.ctx.header:'+this.ctx.header)
            if(this.ctx.header.authorization ==='' || this.ctx.header.authorization ===null ){
                console.log('noToken')
                return this.ctx.body = {username:'username'}
            }
            //version:系统版本
            //sort:分类
            //思考如果是新用户是否免费送

            //const token = this.app.jwt.sign({ username: this.ctx.request.body.username, password: this.ctx.request.body.password }, this.app.config.jwt.secret);
            let tokenVerify = this.app.jwt.verify(this.ctx.header.authorization, this.app.config.jwt.secret);
            let username = await this.app.mysql.get('UserName',{UserName:tokenVerify.username})
            let taskId = this.ctx.header.taskid
            //console.log('task_taskId: '+taskId)
            await this.app.config.resql(taskId)
            let getTask = await this.app.mysql.get('BuyTask',{BuyTaskId:taskId})
            let TaskCommentSql;
            if(getTask.BuyTaskCommentId!==null){
                TaskCommentSql = ' JOIN BuyTaskComment On BuyTask.BuyTaskCommentId = BuyTaskComment.BuyTaskCommentId '
            }else{
                TaskCommentSql = ' '
            }
            let productGetDetailsSql =  'SELECT * FROM BuyTask JOIN UserAccount ON BuyTask.UserAccountId = UserAccount.UserAccountId JOIN SellOrder ON BuyTask.SellOrderId = SellOrder.SellOrderId JOIN SellProduct ON SellOrder.SellProductId = SellProduct.SellProductId JOIN SellShop ON SellProduct.SellShopId = SellShop.SellShopId '+TaskCommentSql+' WHERE BuyTask.BuyTaskId ='+taskId+';'
            let productGetDetails = await this.app.mysql.query(productGetDetailsSql) //获取订单，按订单时间排序获取
            //console.log(productGetDetails[0])
            if(username.UserNameId!==productGetDetails[0].BuyUserNameId || productGetDetails.length===0){
                return this.ctx.body = {username:'username'}
            }
            return this.ctx.body = productGetDetails[0]

        }


        async username() {
            console.log('MIndexUsername')
            if(this.ctx.header.authorization ==='' || this.ctx.header.authorization ===null ){
                console.log('noToken')
                return this.ctx.body = {username:'username'}
            }
            let tokenVerify = this.app.jwt.verify(this.ctx.header.authorization, this.app.config.jwt.secret);
            let username = await this.app.mysql.get('UserName',{UserName:tokenVerify.username})//用户信息
            //拿到买家45天内买过的店铺名
            var sqlsyn = 'SELECT * FROM SellOrder JOIN SellProduct ON SellOrder.SellProductId = SellProduct.SellProductId JOIN SellShop ON SellProduct.SellShopId = SellShop.SellShopId WHERE orderNumber>0 AND event ='+ this.ctx.header.event+' AND SellShop.SellShopId  NOT IN (SELECT SellOrder.sellShopId FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = BuyTask.SellOrderId WHERE buyUserNameId='+username.UserNameId+' AND BuyTaskState <> 0 AND  NOW() - INTERVAL 40 DAY < BuyTaskCreateTime);'
            //var BuyTask = await this.app.mysql.query(sqluservalue)
            return this.ctx.body = username//返回：订单编号+产品主图
        }

        async qntoken(){
            // if(this.ctx.request.body.headers.Authorization ==='' || this.ctx.request.body.headers.Authorization ===null ){
            //         console.log('noToken')
            //         return this.ctx.body = {username:'username'}
            //         }
            // var tokenVerify = this.app.jwt.verify(this.ctx.request.body.headers.Authorization, this.app.config.jwt.secret);
            // var username = await this.app.mysql.get('UserName',{UserName:tokenVerify.username})//用户信息
            // if(username==null){
            //         return this.ctx.body = {status:0,message:'账户还没保存，请重新刷新'}}
            let tokenx;
            try {
                tokenx = await this.app.qiniu.createToken()
            }catch(err){
                console.log(err)
            }
            console.log(tokenx)
            return this.ctx.body = tokenx
        }

        async tcode(){
            return await this.ctx.render('tcode.ejs',{message:''})
            }

    	async addTbAccount(){
			console.log(this.ctx.request.body.headers.Authorization)
		    if(this.ctx.request.body.headers.Authorization ==='' || this.ctx.request.body.headers.Authorization ===null ){
		    	console.log('noToken')
		        return this.ctx.body = {username:'username'}
		    	}
	        var tokenVerify = this.app.jwt.verify(this.ctx.request.body.headers.Authorization, this.app.config.jwt.secret);
	        var username = await this.app.mysql.get('UserName',{UserName:tokenVerify.username})//用户信息
	        var platform = this.ctx.request.body.headers.platform //用户信息
	        var account = this.ctx.request.body.headers.account //用户信息
	        var accountSql = await this.app.mysql.get('UserAccount',{PlatFormUserName:account,PlatForm:platform})//用户信息
	        if(accountSql==null){
		        return this.ctx.body = {status:0,message:'账户还没保存，请重新刷新'}
            }else if(accountSql.UserNameId===null){
                var rowsql = 'UPDATE UserAccount SET UserNameId="' + username.UserNameId + '" WHERE UserAccountId="' + accountSql.UserAccountId + '";'
                var result = await this.app.mysql.query(rowsql);
                return this.ctx.body = {status:2,message:'账户，绑定成功。'}
	        }else if(accountSql.UserNameId!==username.UserNameId){
		        return this.ctx.body = {status:0,message:'在其他账户绑定，请重试。'}
	        }else if(accountSql.UserNameId===username.UserNameId) {
                return this.ctx.body = {status: 1, message: '淘宝账户已在绑定在你名下。'}
            }
            console.log(orderid)
            console.log(username)
            //做过的时间：老的读取订单的算法，如果35天内做过，不做
            var sqlsyn = 'SELECT * FROM SellOrder JOIN SellProduct ON  SellOrder.SellProductId = SellProduct.SellProductId JOIN SellShop ON SellProduct.SellShopId = SellShop.SellShopId WHERE SellShop.SellShopId NOT IN (SELECT SellProduct.SellShopId FROM BuyTask WHERE buyUserNameId='+username.UserNameId+' AND BuyTaskState <> 0 AND  NOW() - INTERVAL 31 DAY > BuyTablesCreateTime)'
            var sqluservalue = 'SELECT * FROM BuyTask JOIN SellOrder ON SellOrder.SellOrderId = SellOrder.SellOrderId WHERE buyUserNameId='+ username.UserNameId +' AND BuyTaskState <> 0'
            console.log(sqlsyn)
            var BuyShop = await this.app.mysql.query(sqlsyn) //获取订单，按订单时间排序获取
            var BuyTask = await this.app.mysql.query(sqluservalue) //获取订单，按订单时间排序获取
            return this.ctx.body = {status:0,message:'请绑定账号'}
            //做过的时间：老的读取订单的算法，如果35天内做过，不做
            //1.搜索45天内没做过的店铺
            //2.判断这个产品是否做过
            //3.如果做过，如果做过，之前的账户是什么账号
            //4.如果实名，切记截图
	}
}
    return mIndex;
}


/*
* 账号是否绑定，返回提醒（请绑定账号）
* 做过的时间：老的读取订单的算法，如果35天内做过，不做
* 时间到了没： 0-24小时+启动时间
* 是否花呗账号：如果要花呗账号是否验证过
* 是否可预约？ websock
* 倒计时怎么做？ timeout ->时间一到自动sql执行
* post方法：如果可以做，调到Details页面 -获取taskid
* 钱怎么算？ 
    * 分任务中 - 进行中
    * 从冻结余额中
    * 完成后从A账户转出 转入B账户
7. 任务中心看得见任务状态
* 任务怎么Details？

*/
/*
* 用户名
	* 用户数据：username
	* 订单数据：username order
		* shop
		* username 
		* shop and username 关系
	* username Infomaition
		* 用户账户等级
		* 注册时间
		* 交易笔数/month（用户）
		* 城市
		* 年龄
		* 性别
* order
	* 现有的订单、店铺、用户
	* 订单的限制
		* 订单用户画像需求：(二期再开发)
			* sex(1/0),city([温州、杭州、上海]),age18-28、Regtime(1985),level:1-10
	* 老用户名
		* 同ip的用户 - 店铺订单是否：保存多ip数据
		* 用户的回购率 + 回购天数
			* 设置一个统一值：淘宝的值也是统一的。
			* 回购天数：看淘宝后台数据，需二次修改
		* 订单的ip与机器码
			* 机器码没有问题
			* ip问题：记录产品所以得ip地址，为了后期的复盘。
* 是否可拍多店铺
	* 是否可拍多产品
		* 是：显示本店多个产品。
		* 否：不显示
	* 可拍多店铺
		* 是：用户不需换ID
		* 否：用户需换ID

* 订单算法
	* 买手收益：存数据先
	* 卖家收益：存数据先
*/




















