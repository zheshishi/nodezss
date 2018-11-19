'use strict';

/**
* [x] mysql
* JWT验证
 */
module.exports = app => {
    const { router, controller } = app;
    router.get('/', controller.home.index);
    //jwt
    router.get("/jwt", app.jwt, "render.index"); // use old api app.jwt
    router.post("/login", "login.index");
    router.post("/mobilelogin", "login.MobileLogin");
    router.post('/sms', controller.sms.index);
    //router.post("/MobileLogin", "MobileLogin.index");
    //router.post("/login", "login.index");
    router.get("/success", "success.index");
    //jwt
    router.get("/m/index", "mIndex.index"); //
    router.get("/m/product", "mIndex.product");
    router.post("/m/genratetask", "mIndex.genratetask");
    router.post("/m/taskstate", "mIndex.TaskState");
    router.post("/m/addaccount", "mIndex.addTbAccount");
    router.get("/m/task", "mIndex.task");
    router.get("/m/closetask", "mIndex.closetask");

    router.post("/m/qntoken", "mIndex.qntoken"); //七牛token
    //web size sell admin网页端商家管理页面

    router.get("/sell", "sell.index"); // sell Login

    //登录 seller admin view
    router.get("/selllogin", "sellLogin.sellLoginGet"); // sell Login
    router.post("/selllogin", "sellLogin.sellLoginPost"); // sell Login
    router.get("/sellmobilelogin", "sellLogin.sellMobileLoginGet"); // sell Login
    router.post("/sellmobilelogin", "sellLogin.sellMobileLoginPost"); // sell Login

    //商家网页端订单管理页面
    router.get("/sell/productpost", "sellProduct.sellProductPostGet"); // sell Login
    router.post("/sell/productpost", "sellProduct.sellProductPostPost"); // sell Login
    router.post("/sell/productinfo", "sellProduct.productGetinfo"); // sell Login
    router.get("/sell/getshop", "sellProduct.getshop"); // ajax getshop
    router.post("/sell/getproduct", "sellProduct.getproduct"); // ajax getproduct
    router.post("/sell/getproductid", "sellProduct.getproductId"); // ajax getproduct
    //router.post("/sell/getproductinfo", "sellProduct.getProductInfo"); // sell Login

    //商家充值页面
    router.get("/sell/topup", "selltopup.topupget"); // sell Login
    router.post("/sell/topup", "selltopup.topuppost"); // sell Login

    //网页crawler
    router.post("/crawler/", "crawler.index"); // sell Login

    //商家网页端订单管理页面
//web size sell admin网页端商家管理页面
};
