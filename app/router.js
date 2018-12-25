'use strict';

/**
* [x] mysql
* JWT验证
 */
module.exports = app => {
    const { router, controller } = app;
    router.get('/', "sell.index");
    //jwt
    router.get("/jwt", app.jwt, "render.index"); // use old api app.jwt
    router.post("/login", "login.Login");
    router.post("/mobilelogin", "login.MobileLogin");
    router.post('/sms', controller.sms.index);
    router.get("/success", "success.index");
    router.post("/verifycard", "login.verifycard");
    router.get("/card", "login.card"); //获取银行卡号
    router.get("/m/getmoney", "login.getmoney"); //手机获取余额
    router.post("/m/withdraw", "login.withdraw"); //手机提现

    //jwt
    router.get("/m/index", "mIndex.index"); //
    router.get("/m/product", "mIndex.product");
    router.post("/m/addaccount", "mIndex.addTbAccount");
    router.get("/t", "mIndex.tcode");//二维码
    router.get("/m/task", "mIndex.task");
    router.post("/m/qntoken", "mIndex.qntoken"); //七牛token
    router.get("/m/qntoken", "mIndex.qntoken"); //七牛token
    router.get("/m/getbuytask", "mIndex.GetBuyTask"); //获取任务
    router.get("/m/getbuytaskclose", "mIndex.GetBuyTaskClose"); //获取任务
    router.get("/m/getbuytaskdone", "mIndex.GetBuyTaskDone"); //获取任务
    router.get("/m/username", "mIndex.username"); //获取任务

    //web size sell admin网页端商家管理页面

    router.get("/m/closetask", "sellTaskState.closetask");
    router.post("/m/taskstate", "sellTaskState.MobileTaskState3");
    router.post("/m/taskstatetwo", "sellTaskState.MobileTaskState6");
    router.post("/m/genratetask", "sellTaskState.genratetask");

    router.get('/sell/selltaskstate3verify','sellTaskState.SellTaskState3Verify');
    router.get('/sell/selltaskstate6verify','sellTaskState.SellTaskState6Verify');
    router.get('/sell/selltaskstate3refuse','sellTaskState.SellTaskState3Refuse');
    router.get('/sell/selltaskstate6refuse','sellTaskState.SellTaskState6Refuse');
    router.get('/sell/sellerclosetask','sellTaskState.SellerCloseTask');
    router.get("/sell/autoclosetask", "sellTaskState.AutoCloseTask");//自动关闭

    router.get("/sell", "sell.index"); // sell Login

    //登录 seller admin view
    router.get("/selllogin", "sellLogin.sellLoginGet"); 
    router.post("/selllogin", "sellLogin.sellLoginPost");
    router.get("/sellmobilelogin", "sellLogin.sellMobileLoginGet");
    router.post("/sellmobilelogin", "sellLogin.sellMobileLoginPost"); 
    //商家网页端订单管理页面
    router.get("/sell/createtask", "sellProduct.CreateTaskGet"); 
    router.post("/sell/createtask", "sellProduct.CreateTaskPost"); 
    router.get("/sell/taskcomment", "sellProduct.taskCommentGet"); 
    router.post("/sell/taskcomment", "sellProduct.taskCommentPost"); 
    router.get("/sell/taskcommentmanager", "sellProduct.TaskCommentManagerGet"); 
    router.get("/sell/taskmanager", "sellProduct.TaskManagerGet");
    router.get("/sell/tasklist", "sellProduct.TaskList");
    router.get("/sell/taskcommentlist", "sellProduct.TaskCommentList");
    router.post("/sell/productinfo", "sellProduct.productGetinfo");
    router.get("/sell/getshop", "sellProduct.getshop"); // ajax getshop
    router.post("/sell/getproduct", "sellProduct.getproduct"); // ajax getproduct
    router.post("/sell/getproductid", "productGetinfo.getproductId"); // ajax getproduct
    //router.post("/sell/getproductinfo", "sellProduct.getProductInfo"); // sell Login

    //商家充值页面
    router.get("/sell/topup", "selltopup.topupget"); // sell Login
    router.post("/sell/topup", "selltopup.topuppost"); // sell Login
    router.get("/sell/finance", "selltopup.finance"); // sell Login
    router.get("/sell/getcardid", "selltopup.getcardid"); // sell Login

    //网页crawler
    router.post("/crawler/", "crawler.index"); // sell Login

    //商家网页端订单管理页面
//web size sell admin网页端商家管理页面
};
