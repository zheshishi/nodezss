const Controller = require('egg').Controller;
const fs = require('fs')
//var sleep = require('sleep');
//爬虫库
const puppeteer = require('puppeteer')

const browser_info = {
                headless: true,
                //executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
            }

module.exports = app => {  
	class sellController extends Controller {
	    async productinfo(){
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
	        //3. spider
	        // test  url 爬虫
	        if (judgeProductExist === 0) {
	            console.log('textspider' + ProductUrl)
	            console.log(Date())
	            const browser = await puppeteer.launch(browser_info)
	            const page = await browser.newPage();

	            await page.setViewport({width: 1280, height: 1080});
	            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
	            console.log('goto' + Date() +'url:'+ProductUrl)
	            try{
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
		            return this.ctx.body = getshop_shopName
	            	//save product
		        }catch(error){
		            await browser.close()
		        	console.log('chrome error');
		        	console.log(error);
		            return this.ctx.body = {status:0,message:'未知错误请重试'}

	        }
	        }
	    }
	}
    return sellController;

}