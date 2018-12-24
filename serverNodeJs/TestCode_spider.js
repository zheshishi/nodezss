//const fs = require('fs')
const cheerio = require('cheerio')
const puppeteer = require('puppeteer');
var https = require('https');
var path = require('path');

var index = 1; //页面数控制
var url = 'http://www.ygdy8.net/html/gndy/dyzz/list_23_';
var titles = []; //用于保存title


async function puppeteer(){
	const puppeteer = require('puppeteer');
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.setRequestInterception(true);
	page.on('request', request => {
	  if (request.resourceType() === 'image')
	      request.abort();
	    else
	      request.continue();
	  });
	await page.goto('https://news.google.com/news/');
	await page.screenshot({path: 'news.png', fullPage: true});
	await browser.close();
}

function getTitle(url, i) {
  console.log("正在获取第" + i + "页的内容"); 
  https.get(url, function(sres) {
    sres.on('data', function(d) {
        var decoded_data = d.toString('utf-8');
        console.log(decoded_data)  
    });
  });
}

function main() {
  console.log("开始爬取");
  getTitle('https://detail.m.tmall.com/item.htm?id=559916827369');
}
puppeteer()
//main()


//

// (async() =>{
//     console.log(Date())
//     const browser = await puppeteer.launch(
//     {headless: false}//use browser head
//     );
//     const page = await browser.newPage();
//     await page.setViewport({
//         width: 1280,
//         height: 1080
//         });
//     await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
//     console.log('goto'+Date())
//     //await page.goto('http://www.ip138.com/useragent/');
//     await page.goto('https://detail.m.tmall.com/item.htm?id=564732645681');
//     console.log(Date())
//     await page.screenshot({path: 'example.png'});
//     console.log(Date())
//     //await browser.close()
//     console.log(Date())
// })();


// /* co */
// var co = require('co');

// co(function *(){
//     // yield any promise
//     var result = yield Promise.resolve(true);
// }).catch(onerror);

// co(function *(){
//     var a = Promise.resolve(1);
//     var b = Promise.resolve(2);
//     var c = Promise.resolve(3);
//     var res = yield [a,b,c];
//     console.log(res);
// }).catch(onerror);

// function onerror(err) {
//   // log any uncaught errors
//   // co will not throw any errors you do not handle!!!
//   // HANDLE ALL YOUR ERRORS!!!
//   console.error(err.stack);
// }


/* co */


// var Crawler = require("crawler");
// var c = new Crawler({
//     maxConnections : 10,
//     // This will be called for each crawled page
//     callback : function (error, res, done) {
//         if(error){
//             console.log(error);
//         }else{
//             var $ = res.$;
//             // $ is Cheerio by default
//             //a lean implementation of core jQuery designed specifically for the server
//             console.log($("title").text());
//         }
//         done();
//     }
// });
// // c.queue([{
// //     uri: 'https://m.1688.com/offer/535627355599.html?spm=a26g8.7662792.1998744630.87',
// //     callback: function (error, res, done) {
// //         if(error){
// //             console.log(error);
// //         }else{
// //         fs.writeFile('1688.html',res.body)
// //             console.log(res.body);
// //         }
// //         done();
// //     }
// // }]);


// //https://item.taobao.com/item.htm?&id=571880547037
// //https://h5.m.taobao.com/awp/core/detail.htm?id=12555079023
// c.queue([{
//     //uri: 'https://h5.m.taobao.com/awp/core/detail.htm?id=12555079023',
//     uri: 'https://item.taobao.com/item.htm?&id=571880547037',
//     callback: function (error, res, done) {
//         if(error){
//             console.log(error);
//         }else{
//         fs.writeFile('taobao.html',res.body)
//             console.log(res.body);
//         }
//         done();
//     }
// }]);

// c.queue([{
//     uri: 'https://detail.m.tmall.com/item.htm?id=559916827369',
//     callback: function (error, res, done) {
//         if(error){
//             console.log(error);
//         }else{
//         fs.writeFile('tmall.html',res.body)
//             console.log(res.body);
//         }
//         done();
//     }
// }]);

// c.queue([{
//     uri: 'https://item.m.jd.com/product/6165650.html',
//     callback: function (error, res, done) {
//         if(error){
//             console.log(error);
//         }else{
//         fs.writeFile('jd.html',res.body)
//             console.log(res.body);
//         }
//         done();
//     }
// }]);


//crawler


// async function test(){
//     const browser = await puppeteer.launch({
//     headless: false //这个是 是否打开chrome可视化窗口 true是不打开 false是打开
//  })
//  //获取page实例
// console.log('AAAA')
// const page = await browser.newPage()
//     await page.setViewport({
//         width: 1280,
//         height: 1080
//         });
//     await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
//     console.log('goto'+Date())
//         //await page.goto('http://www.ip138.com/useragent/');



//      //我这里是通过 入参传过来的 分类来判断抓取相应页面的数据
//     await page.goto('https://h5.m.taobao.com/awp/core/detail.htm?id=575565844814')
//     //await page.goto('https://detail.m.tmall.com/item.htm?id=564732645681');
//     console.log('goto')

//     await page.evaluate(function () {window.scrollTo(0,90000)})
//     sleep.sleep(2)
//     console.log('scroll')
//     await page.evaluate(function () {window.scrollTo(0,90000)})
//     console.log('scroll')
//     await page.evaluate(function () {window.scrollTo(0,90000)})
//     console.log('scroll')
//     await page.evaluate(function () {window.scrollTo(0,90000)})
//     console.log('scroll')
//     sleep.sleep(2)

//     // await page.evaluate(function () {window.scrollTo(0,90000)})
//     // await page.evaluate(function () {window.scrollTo(0,90000)})
//     //await page.evaluate(function () {window.scrollTo(0,1)})

//     console.log('page.content')
//     let bodyHTML = await page.evaluate(() => document.body.innerHTML);
//     fs.writeFile('text.html',bodyHTML)
//     await browser.close()
// }
// test()
