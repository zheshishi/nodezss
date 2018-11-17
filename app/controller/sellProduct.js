'use strict';
//商家登录页面
const Controller = require('egg').Controller;
const fs = require('fs')
//var sleep = require('sleep');
//爬虫库
const puppeteer = require('puppeteer')


class sellController extends Controller {
    async sellProductPostGet() {
        if (!this.ctx.cookies.get('username', {encrypt: true})) {
            return this.ctx.redirect('/selllogin')
        }
        let cookieget = this.ctx.cookies.get('username', {encrypt: true})
        await this.ctx.render('sellProductPost.ejs', {message: '', shopname: ''})
    }
    async sellProductPostPost() {
        if (!this.ctx.cookies.get('username', {encrypt: true})) {
            return this.ctx.redirect('/selllogin')
        }
        var CookieUserName = this.ctx.cookies.get('username', {encrypt: true})
        var UserName = await this.app.mysql.get('UserName', {UserName: CookieUserName})

        //* 是否花呗的读取方式
        //* 余额是否充足 总金-(任务中的活动-500)
        //* 产品编号是否是他的
        //* 思考如果后期扩展字段怎么办只有一个怎么办？
        try {
            //先确定数据是否正确 -金额、件数、产品id、关键词、活动类型、交易笔数
            var event = parseInt(this.ctx.request.body.event)
            var productinfoID = parseInt(this.ctx.request.body.productinfoID)
            var MinTime = parseInt(this.ctx.request.body.sdMinTime)
            var MaxTime = parseInt(this.ctx.request.body.sdMaxTime)
            if(MinTime>=MaxTime){return await this.ctx.render('sellProductPost.ejs', {message: '试用时间开始不能小于完成时间', shopname: ''})}
            var buyPrice = parseFloat(this.ctx.request.body.buyPrice).toFixed(2)
            var buyNum = parseInt(this.ctx.request.body.buyNum)
            var buyRules = this.ctx.request.body.buyRules
            var showPrice = parseFloat(this.ctx.request.body.showPrice).toFixed(2)
            if (showPrice  ==="NaN"){var showPrice = buyPrice}
            var nowdatetime = new Date()
            var dalayReceive = parseInt(this.ctx.request.body.dalayReceive)
            nowdatetime.setDate(nowdatetime.getDate() + dalayReceive)
            var startDate = (nowdatetime).toJSON().slice(0,10);
            var orderNumber = this.ctx.request.body.orderNumber
            if (this.ctx.request.body.ReturnBuyPrice === "on") { 
                var ReturnBuyPrice = parseFloat(this.ctx.request.body.ReturnBuyPrice).toFixed(2)
            } else {
                var ReturnBuyPrice = null
            }
            if (this.ctx.request.body.gift === "on") {var gift = 1} else {var gift = 1}
            //附加优惠卷   
            if (this.ctx.request.body.AddCoupons === "on") {var AddCoupons = 1} else {var AddCoupons = 0}
            //附加打开其他店铺
            if (this.ctx.request.body.AddOpenOtherProduct === "on") {var AddOpenOtherProduct = 1} else {var AddOpenOtherProduct = 0}
            //附加收藏截图店铺
            if (this.ctx.request.body.AddSaveShop === "on") {var AddSaveShop = 1} else {var AddSaveShop = 0}
            if (this.ctx.request.body.AddShoppingCar === "on") {var AddShoppingCar = 1} else {var AddShoppingCar = 0}
            if (this.ctx.request.body.AddOpenProduct === "on") {var AddOpenProduct = 1} else {var AddOpenProduct = 0}
            if (this.ctx.request.body.AddCommandsLike === "on") {var AddCommandsLike = 1} else {var AddCommandsLike = 0}
            if (this.ctx.request.body.AddChat === "on") {var AddChat = 1} else {var AddChat = 0}
            //允许信用卡支付
            
            if(this.ctx.request.body.PayCard === "on") {var PayCard = 1} else {var PayCard = 0}
            if(this.ctx.request.body.PayCoupons === "on") {var PayCoupons = 1} else {var PayCoupons = 0}
            if (this.ctx.request.body.Payhuabei === "on") {var Payhuabei = 1} else {var Payhuabei = 0}
            //if(this.ctx.request.body.huabeiId === "on") {var huabeiId = 1} else {var huabeiId = 1}
          
          
            var huabeiId=1//在没测试的情况下先用只能花呗关系
            //允许花呗支付
            //console.log('AddSaveShop:'+JSON.stringify(this.ctx.request.body))
            //console.log('AddSaveShop:'+this.ctx.request.body.AddSaveShop)

            var gifturl = this.ctx.request.body.gifturl
            var orderNote = this.ctx.request.body.orderNote

            if (event < 0.1 || productinfoID < 0.1 || buyPrice < 1 || buyNum < 1) {
                return await this.ctx.render('sellProductPost.ejs', {message: '请填写正确数字信息', shopname: ''})
            }
            //task array
            if(typeof orderNumber === 'string'){
                var orderNumberSum=parseInt(orderNumber)
            }else if(orderNumber.includes('')){
                return await this.ctx.render('sellProductPost.ejs', {message: '请填满关键词任务数量', shopname: ''})
            }else{
                var orderNumberSum = orderNumber.reduce((a, b) => parseInt(a) + parseInt(b))
            }
            console.log(AddOpenProduct)
            console.log(AddCommandsLike)
            console.log(AddChat)
            var coupons = AddCoupons + AddOpenOtherProduct + AddSaveShop + AddShoppingCar + AddOpenProduct + AddCommandsLike + AddChat

            //任务金额算法lso
            console.log('coupons:'+coupons+'buyPrice:'+buyPrice+'buyNum:'+buyNum+'huabeiId:'+huabeiId)
            var additionalMoney = huabeiId * 2 + coupons + 2 //附加任务金额，event1红包任务附加算法
            var BuyUseraAdditionalMoney = huabeiId * 1 + coupons* 0.5 //附加任务金额，event2试用任务附加算法
            var eventMoney
            var buyUserMoney
            if (event === 1) {
                var eventMoney = buyPrice * buyNum + parseInt((buyPrice * buyNum) / 100) + 7 + additionalMoney  //卖家金额* 算法
                var buyUserMoney = buyPrice * buyNum + parseInt((buyPrice * buyNum) / 100) + 5 + BuyUseraAdditionalMoney //用户金额* 算法
            }else if(event === 2){
                var eventMoney = buyPrice * buyNum + additionalMoney//总资金
                var buyUserMoney = buyPrice * buyNum + BuyUseraAdditionalMoney
            }
            //任务金额算法
            var getTaskMoney = eventMoney * orderNumberSum
            var keyword = this.ctx.request.body.keyword
            console.log('eventMoney:'+eventMoney+'buyUserMoney:'+buyUserMoney)
            if(keyword===''){
                return await this.ctx.render('sellProductPost.ejs', {message: '请填满关键词', shopname: ''})
            }
            var city = this.ctx.request.body.city
            var orderSort = this.ctx.request.body.orderSort
            var PriceMin = this.ctx.request.body.PriceMin
            var PriceMax = this.ctx.request.body.PriceMax
            //task array
        } catch (e) {
            console.log('error:' + e)
            return await this.ctx.render('sellProductPost.ejs', {message: '请填写正确数字的信息', shopname: ''})
        }
        //task array

        //查看余额商家
        //进行中的订单 - 搜商家用户名的任务
        //进行中的任务 - 搜订单用户名的订单
        // var runOrderMoney = 0
        // console.log(this.app.config.webUrl)
        // var getorderquery = 'SELECT * FROM SellOrder JOIN SellProduct ON SellOrder.SellProductId= SellProduct.SellProductId JOIN SellShop ON SellProduct.SellShopId = SellShop.SellShopId WHERE orderNumber > 0 AND SellShop.UserNameId=' + UserName.UserNameId + ';'
        // try {
        //     var getorder = await this.app.mysql.query(getproductquery)
        //     for (var oml = 0; oml < getorder.length; oml++) {
        //         runOrderMoney += getorder[oml].SellPayPrice * getorder[oml].orderNumber
        //     }
        // } catch (e) {
        //     console.log(e)
        //     var getorder = null
        // }
        // var getTaskQuery = 'SELECT * FROM BuyTask JOIN SellOrder ON BuyTask.SellOrderId = SellOrder.SellOrderId WHERE BuyTaskState NOT IN （0，1） AND SellShop.UserNameId= =' + UserName.UserNameId + ';'
        // try {
        //     var getTask = await this.app.mysql.query(getTaskQuery)

        // for (var tml = 0; tml < getorder.length; tml++) {
        //     runOrderMoney += getTask[tml].SellMoney
        // }
        // } catch (e) {
        //     console.log(e)
        //     var getTask = null
        // }
        var money = await this.app.mysql.get('FinancialBalance', {UserNameId: UserName.UserNameId})
        console.log('line90 money:')
        console.log(money)

        if (money.Balance < getTaskMoney + 500) {
            var returnmoney = getTaskMoney+ 500 - money.Balance
            return await this.ctx.render('sellProductPost.ejs', {
                message: '余额不足，请充值：' + returnmoney + '（保证邮费与差价）',
                shopname: ''
            })
        }
        //1. 判断资金是否足够 - > 任务确定有木有钱

        //判断店铺用户
        var getproductquery = 'SELECT * FROM SellProduct JOIN SellShop ON SellProduct.SellShopId = SellShop.SellShopId WHERE SellProductId =' + this.ctx.request.body.productinfoID + ';'
        var getproduct = await this.app.mysql.query(getproductquery)
        if (getproduct[0].UserNameId == UserName.UserNameId) {
        } else if (getproduct[0].UserNameId == null) {
            var rowsql = 'UPDATE SellShop SET UserNameId="' + UserName.UserNameId + '" WHERE SellShopId="' + getproduct[0].SellShopId + '";'
            var result = await this.app.mysql.query(rowsql);
        } else {
            return await this.ctx.render('sellProductPost.ejs', {message: '店铺在其他用户名下，请联系客服', shopname: ''})
        }
        //判断店铺用户


        //3. 判断店铺是否存在 - > 绑定店铺是否>10家
        //https://shopsearch.taobao.com/search?app=shopsearch&q=宅原品日式烧桐木家居

        async function addOrder(app, keywordx, orderNumberx, cityx, orderSortx, PriceMinx, PriceMaxx) {
            var MysqlProduct = await app.mysql.get('SellProduct', {SellProductId: productinfoID})
            var eventinsert = await app.mysql.insert('SellOrder', {
                SellProductId: productinfoID,
                SellShopId: MysqlProduct.SellShopId,
                UserNameId: UserName.UserNameId,
                event: event,
                gift: gift,
                gifturl: gifturl,
                BuyPrice: buyPrice,
                buyNum: buyNum,
                showPrice: showPrice,
                ReturnBuyPrice: ReturnBuyPrice,
                buyRules:buyRules,
                Node: orderNote,
                MinTime: MinTime,
                MaxTime: MaxTime,
                startDate: startDate,
                AddCoupons: AddCoupons,
                AddOpenOtherProduct: AddOpenOtherProduct,
                AddSaveShop: AddSaveShop,
                AddShoppingCar: AddShoppingCar,
                AddOpenProduct: AddOpenProduct,
                AddCommandsLike:AddCommandsLike,
                AddChat: AddChat,
                PayCoupons: PayCoupons,
                PayCard: PayCard,
                Payhuabei: Payhuabei,
                huabeiId: huabeiId,//输入数据
                KeyWord: keywordx,
                orderNumber: orderNumberx,
                city: cityx,
                orderSort: orderSortx,
                PriceMin: PriceMinx,
                PriceMax: PriceMaxx,
                SellPayPrice: eventMoney,
                BuyGetPrice: buyUserMoney,
            });
            console.log(eventinsert.affectedRows === 1)
            var updateMoneySql ='UPDATE FinancialBalance SET Balance=Balance-'+orderNumberx*eventMoney + ',PerformMoney=PerformMoney+'+orderNumberx*eventMoney + ' WHERE UserNameId="' + UserName.UserNameId + '";'
            console.log(updateMoneySql)
            console.log('updateMoneySql')
            var eventinsert = await app.mysql.query(updateMoneySql)
        }

        //task save mysql
        if(typeof orderNumber == 'string') {
            await addOrder(this.app,keyword, parseInt(orderNumber), city, orderSort, PriceMin, PriceMax)
        }else{
            for (var j = 0; j < orderNumber.length; j++){
                if(parseInt(orderNumber[j])>0){
                    try{
                        var cityx=city[j]
                    }catch(e){
                        var cityx=''
                    }
                    try{var orderSortx =orderSort[j]}catch(e){var orderSortx=''}
                    try{var PriceMinx =PriceMin[j]}catch(e){var PriceMinx=''}
                    try{var PriceMaxx =PriceMax[j]}catch(e){var PriceMaxx=''}
                }
                    await addOrder(this.app, keyword[j], parseInt(orderNumber[j]), cityx, orderSortx, PriceMinx, PriceMaxx)
                }
            }


        //4. 保存任务数
        //5. 条件附加收费模式
        return await this.ctx.render('sellProductPost.ejs', {message: '发布任务成功，请到任务区查看进行中的任务', shopname: ''})
    }
    async productGetinfo(){
        console.log('productGetinfo' + Date())
        //如果没有cookie不给数据
        if (!this.ctx.cookies.get('username', {encrypt: true})) {
            return  this.ctx.body = null
        }
        //如果没有cookie不给数据
        var getUrl = this.ctx.request.body.getUrl
        console.log(getUrl)
        //productInfo
        var GetUrlId = ''  //产品id
        var GetUrlPlatForm = '' //产品平台
        var ProductUrl = '' //产品网址
        var sellShopUserName = '' //店铺用户名
        var selllProductName = '' //产品名称
        var sellShopNickname = '' //店铺昵称
        var price = '' //产品价格
        var ProductMain = [] //产品主图
        var ProductDetails = [] //产品说明
        var ProductLocal = '' //发货地
        //2. 正则表达式产品网址
        if (getUrl.indexOf('tmall.com') > -1) {
            if (getUrl.indexOf('?id=') > -1 || getUrl.indexOf('&id=') > -1) {
                var re1 = '&id=(\\d+)'; // Uninteresting: int
                if (getUrl.indexOf('?id=') > -1) {
                    re1 = 'id=(\\d+)'; // Uninteresting: int
                }
                var p = new RegExp(re1, 'i');
                var m = p.exec(getUrl);
                if (m != null) {
                    GetUrlId = m[1]
                    GetUrlPlatForm = 'tmall'
                } else {
                    return this.ctx.body = {status:0,message:'请输入正确的网址'};
                }
                ProductUrl = 'https://detail.m.tmall.com/item.htm?id=' + GetUrlId
            } else {
                return this.ctx.body = {status:0,message:'请输入正确的网址'};
            }
        } else if (getUrl.indexOf('taobao.com') > -1) {
            if (getUrl.indexOf('?id=') > -1 || getUrl.indexOf('&id=') > -1) {
                var re1 = '&id=(\\d+)'; // Uninteresting: int
                if (getUrl.indexOf('?id=') > -1) {
                    re1 = 'id=(\\d+)'; // Uninteresting: int
                }
                var p = new RegExp(re1, 'i');
                var m = p.exec(getUrl);
                console.log(m)
                if (m != null) {
                    GetUrlId = m[1]
                    GetUrlPlatForm = 'taobao'
                } else {
                    return this.ctx.body = {status:0,message:'请输入正确的网址'};
                }
                ProductUrl = 'https://item.taobao.com/item.htm?&id=' + GetUrlId
                //ProductUrl = 'https://h5.m.taobao.com/awp/core/detail.htm?&id=' + GetUrlId
            } else {
                return this.ctx.body = {status:0,message:'请输入正确的网址'};
            }
        } else if (getUrl.indexOf('1688.com') > -1 && getUrl.indexOf('.html') > -1) {
            var re1 = '/(\\d+).html'; // Uninteresting: int
            var p = new RegExp(re1, 'i');
            var m = p.exec(getUrl);
            if (m != null) {
                GetUrlId = m[1]
                GetUrlPlatForm = '1688'
            } else {
                return this.ctx.body = {status:0,message:'请输入正确的网址'};
            }
            ProductUrl = 'https://m.1688.com/offer/' + GetUrlId + '.html'
        } else if (getUrl.indexOf('jd.com') > -1 && getUrl.indexOf('.html') > -1) {
            var re1 = '/(\\d+).html'; // Uninteresting: int
            var p = new RegExp(re1, 'i');
            var m = p.exec(getUrl);
            if (m != null) {
                GetUrlId = m[1]
                GetUrlPlatForm = 'jd'
                console.log("GetUrlId:" + GetUrlId + " GetUrlPlatForm:" + GetUrlPlatForm)
            } else {
                return this.ctx.body = {status:0,message:'请输入正确的网址'};
            }
            ProductUrl = 'https://item.m.jd.com/product/' + GetUrlId + '.html'
        } else {
            return this.ctx.body = {status:0,message:'请输入正确的网址'};
        }
        //2. 正则表达式产品网址
        // https://detail.1688.com/offer/565080090678.html
        // https://m.1688.com/offer/535627355599.html?spm=a26g8.7662792.1998744630.87
        // https://h5.m.taobao.com/awp/core/detail.htm?id=12555079023
        // https://detail.m.tmall.com/item.htm?id=559916827369
        // https://item.m.jd.com/product/6165650.html

        // judge判断是否有产品与店铺
        console.log('judgeProductExist')
        var judgeProductExist = 0
        var MysqlProduct = await this.app.mysql.select('SellProduct', {
            where: {ProductId: GetUrlId}
        })
        if (MysqlProduct.length>0) {
            for (var i of MysqlProduct) {
                var MysqlProductShop = await this.app.mysql.get('SellShop', {SellShopId: i.SellShopId})
                if (MysqlProductShop.ShopSort === GetUrlPlatForm) {
                    judgeProductExist = 1
                    return this.ctx.body = i
                }
            }
        }
        // judge判断是否有产品与店铺
        console.log('browser:'+GetUrlId)
        //3. spider
        // test  url 爬虫
        if (judgeProductExist === 0) {
            console.log('textspider' + ProductUrl)
            console.log(Date())
            const browser = await puppeteer.launch({
                headless: true,
                executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
            })
            const page = await browser.newPage();

            await page.setViewport({width: 1280, height: 1080});
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
            console.log('goto' + Date() +'url:'+ProductUrl)
            //我这里是通过 入参传过来的 分类来判断抓取相应页面的数据
            await page.goto(ProductUrl);
            //await page.evaluate(function () {window.scrollTo(0,7000)})
            let bodyHTML = await page.evaluate(() => document.body.innerHTML);
            //fs.writeFile('textOrigin.html', bodyHTML)
            //bodyHTML = bodyHTML.replace(/<\/?[^>]*>/g,''); //去除HTML tag
            bodyHTML = bodyHTML.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
            bodyHTML = bodyHTML.replace(/\n[\s| | ]*\r/g, '\n'); //去除多余空行
            bodyHTML = bodyHTML.replace(/ /ig, '');//去掉
            bodyHTML = bodyHTML.replace(/^[\s　]+|[\s　]+$/g, "");//去掉全角半角空格
            bodyHTML = bodyHTML.replace(/[\r\n]/g, "");//去掉回车换行
            bodyHTML = bodyHTML.replace(/&nbsp;/ig, '');
            //fs.writeFile('text.html', bodyHTML)
            await browser.close()
            console.log('close browser' + Date())
            // spider

            //正则读数据
            if (GetUrlPlatForm == 'taobao') {
                try {
                    sellShopUserName = /掌柜：<\/span>(.{1,18})<\/p>/g.exec(bodyHTML)[1]
                } catch (e) {
                    try {
                        sellShopUserName = /title="掌柜：(.{1,18})">/g.exec(bodyHTML)[1]
                    }catch (e) {
                        sellShopUserName = /title="掌柜:(.{1,18})"/g.exec(bodyHTML)[1]
                    }
                }
                try {
                    sellShopNickname = /店铺名称：<\/span><spanclass="shop-name-title"title="(.{1,18})">/g.exec(bodyHTML)[1]
                } catch (e) {
                    sellShopNickname = /taobao.com"title="(.{1,18})"target/g.exec(bodyHTML)[1]
                }
                //https://item.taobao.com/item.htm?spm=a230r.1.14.47.1a9d6209AYXtdJ&id=532778626075&ns=1&abbucket=11#detail
                // if (bodyHTML.indexOf('工商执照：') > -1) {
                //     //企业店铺
                //     sellShopUserName = /掌柜：<\/span>(.{1,18})<\/p>/g.exec(bodyHTML)[1]
                //     console.log(sellShopUserName)
                //     //店铺名
                //     sellShopNickname = /店铺名称：<\/span><spanclass="shop-name-title"title="(.{1,18})">/g.exec(bodyHTML)[1]
                //     console.log(sellShopNickname)
                // } else {
                //     //淘宝店
                //     sellShopUserName = /title="掌柜：(.{1,18})">/g.exec(bodyHTML)[1]
                //     console.log(sellShopUserName)
                //     //店铺名
                //     sellShopNickname = /taobao.com"title="(.{1,18})"target/g.exec(bodyHTML)[1]
                //     console.log(sellShopNickname)
                // }

                //产品名
                selllProductName = /"tb-main-title"data-title="(.{1,50})">/g.exec(bodyHTML)[1]
                console.log(selllProductName)
                //产品名

                //产品主图
                var reDetails1 = /="J_UlThumb".+?<\/ul>/g
                var Detailshtml1 = bodyHTML.match(reDetails1)
                var re = /(\w{2,7}.alicdn.com.{10,100}?jpg)/g
                //var re = /({\w{2,4}.alicdn.{5,100}?jpg})_50x50.jpg"/g
                ProductMain = Detailshtml1[0].match(re)
                ProductMain =Array.from(new Set(ProductMain));
                ProductMain = ProductMain.map(x=>('https://'+x))
                console.log(ProductMain)
                //产品详情图
                //var reDetails = /<divid="J_DivItemDesc.+?<\/div>/g
                var reDetails = /<divid="J_DivItemDesc.+?id="reviews"/g

                var Detailshtml = bodyHTML.match(reDetails)
                var re = /(\w{2,7}.alicdn.com.{5,100}?.jpg)/g
                ProductDetails = Detailshtml[0].match(re)
                console.log(ProductDetails)
                ProductDetails = ProductDetails.map(x=>('https://'+x))
                //产品详情图


            } else if (GetUrlPlatForm === 'tmall') {
                //店铺名
                sellShopUserName = /<divclass="shop-name"title="(.{1,18}?)"/g.exec(bodyHTML)[1]
                sellShopNickname = sellShopUserName
                //店铺名
                //产品名
                selllProductName = /maincell">(.{1,50}?)<\/div>/g.exec(bodyHTML)[1]
                //产品名
                //产品主图
                var reDetails1 = /scrollerpreview-scroller".+?<\/div>/g
                var Detailshtml1 = bodyHTML.match(reDetails1)
                var re = /(\w{2,7}.alicdn.com.{10,100}?jpg)/g
                ProductMain = Detailshtml1[0].match(re)
                ProductMain =Array.from(new Set(ProductMain));
                ProductMain = ProductMain.map(x=>('https://'+x))

                //产品详情图
                var reDetails = /mui-custommodule-itemunloaded.+商品详情图/g
                var Detailshtml = bodyHTML.match(reDetails)
                var re = /(\w{2,7}.alicdn.com.{5,100}?.jpg)/g
                ProductDetails = Detailshtml[0].match(re)
                ProductDetails =Array.from(new Set(ProductDetails));
                ProductDetails = ProductDetails.map(x=>('https://'+x))

                //产品详情图
                console.log(ProductMain)
                console.log(ProductDetails)
                //产品详情
            } else if (GetUrlPlatForm == '1688') {
                //店铺名
                sellShopUserName = /<pclass="company">(.+?)<\/p>/g.exec(bodyHTML)[1]
                sellShopNickname = sellShopUserName
                //店铺名
                //产品名
                selllProductName = /"subject":"(.+?)"/g.exec(bodyHTML)[1]
                //产品名
                //产品主图
                var reDetails1 = /divid="d-swipe"(.+?)class="swipe-nav/g
                var Detailshtml1 = bodyHTML.match(reDetails1)
                var re = /(\w{2,7}.alicdn.com.{10,100}?jpg)/g
                ProductMain = Detailshtml1[0].match(re)
                ProductMain =Array.from(new Set(ProductMain));
                ProductMain = ProductMain.map(x=>('https://'+x))
                //产品详情图 1688 产品图需js滚动加载

                //产品详情图
                console.log(ProductMain)
                console.log(ProductDetails)
                //产品详情
            } else if (GetUrlPlatForm == 'jd') {
                //店铺名
                sellShopUserName = /<emid="shopName">(.+?)<\/em>/g.exec(bodyHTML)[1]
                sellShopNickname = sellShopUserName
                //店铺名
                //产品名
                selllProductName = /"skuName":"(.+?)"/g.exec(bodyHTML)[1]
                //产品名
                //产品主图
                var reDetails1 = /class="pic_list"(.+?)<\/ul>/g
                var Detailshtml1 = bodyHTML.match(reDetails1)
                var re = /(\w{1,6}.360buyimg.com.{10,100}?jpg)/g
                ProductMain = Detailshtml1[0].match(re)
                ProductMain =Array.from(new Set(ProductMain));
                ProductMain = ProductMain.map(x=>('https://'+x))
                console.log(ProductMain)

                //产品详情图1688产品图需js滚动加载
                var reDetails = /detail_list(.+?)<script>/g
                var Detailshtml = bodyHTML.match(reDetails)
                var re = /(\w{1,6}.360buyimg.com.{10,100}?jpg)/g
                ProductDetails = Detailshtml[0].match(re)
                ProductDetails =Array.from(new Set(ProductDetails));
                ProductDetails = ProductDetails.map(x=>('https://'+x))
                console.log(ProductDetails)

                //产品详情图
            }
            //判断店铺是不是他的
            //主图和产品用json保存
            //save product
            var DetailsValues = {
                'name': selllProductName,
                'price': price,
                'address': ProductLocal,
                'mainImage': ProductMain,
                'DetailsImage': ProductDetails
            }
            var DetailsValuesX = JSON.stringify(DetailsValues);
            var returnSellProductId = '';
            //判断店铺是否存在
            var judgeShopName = await this.app.mysql.get('SellShop', {
                ShopUserName: sellShopUserName,
                ShopSort: GetUrlPlatForm
            });
            if (judgeShopName) {
                var SaveProductResult = await this.app.mysql.insert('SellProduct', {
                    SellShopId: judgeShopName.SellShopId,
                    ProductId: GetUrlId,
                    Details: DetailsValuesX,
                    ShopSort: GetUrlPlatForm
                });
                returnSellProductId = SaveProductResult.insertId
                console.log(SaveProductResult.affectedRows)
            } else {
                var SaveShopResult = await this.app.mysql.insert('SellShop', {
                    ShopUserName: sellShopUserName,
                    ShopNickName: sellShopNickname,
                    ShopSort: GetUrlPlatForm
                });
                console.log(SaveShopResult.affectedRows)
                //save product
                var judgeShopName = await this.app.mysql.get('SellShop', {
                    ShopUserName: sellShopUserName,
                    ShopSort: GetUrlPlatForm
                });
                var SaveProductResult = await this.app.mysql.insert('SellProduct', {
                    SellShopId: judgeShopName.SellShopId,
                    ProductId: GetUrlId,
                    Details: DetailsValuesX,
                    ShopSort: GetUrlPlatForm
                });
                returnSellProductId = SaveProductResult.insertId
                console.log(SaveProductResult.insertId)
            }

            var getshop_shopName = await this.app.mysql.get('SellProduct', {SellProductId:returnSellProductId})
            console.log(Date())
            return this.ctx.body = getshop_shopName
            //save product

        }
    }
        //save shop
    async getshop(){
        console.log('getshop')
        if (!this.ctx.cookies.get('username', {encrypt: true})) {
            return  this.ctx.body = null
        }
        let CookieUserName = this.ctx.cookies.get('username', {encrypt: true})
        var UserName = await this.app.mysql.get('UserName', {UserName: CookieUserName})
        var getshop_shopName = await this.app.mysql.select('SellShop', {where:{UserNameId: UserName.UserNameId, status:0}})
        return this.ctx.body = getshop_shopName
    }
    async getproduct(){
        console.log('getproduct')
        if (!this.ctx.cookies.get('username', {encrypt: true})) {
            return this.ctx.body = null
        }
        let CookieUserName = this.ctx.cookies.get('username', {encrypt: true})
        var UserName = await this.app.mysql.get('UserName', {UserName: CookieUserName})
        var getShopId = this.ctx.request.body.shopid
        var getshop_shopName = await this.app.mysql.select('SellProduct', {where:{SellShopId:this.ctx.request.body.shopid}})
        return this.ctx.body = getshop_shopName
    }
    async getproductId(){
        console.log('getproductId')
        if (!this.ctx.cookies.get('username', {encrypt: true})) {
            return this.ctx.body = null
        }
        let CookieUserName = this.ctx.cookies.get('username', {encrypt: true})
        var UserName = await this.app.mysql.get('UserName', {UserName: CookieUserName})
        var SellProductId = this.ctx.request.body.SellProductId
        console.log(typeof SellProductId)
        var getshop_shopName = await this.app.mysql.get('SellProduct', {SellProductId:this.ctx.request.body.SellProductId})
        return this.ctx.body = getshop_shopName
    }
}
module.exports = sellController;
