function ajaxGetshop() {
    $.ajax({
        method: "GET",
        url: "/sell/getshop",
        success: function (data, status) {
            urlgetshop(data)
        }
    })
}
//获取店铺

function urlgetshop(data) {
    if (data !== null) {
        $("#Selectshop").empty()
        $("#Selectshop").append("<option value='0'>选择店铺</option>")
        for (var AjaxSelectShopValue in data) {
            var AjaxSsll = '<option value=' + data[AjaxSelectShopValue].SellShopId + '>' + data[AjaxSelectShopValue].ShopSort +
                ' - ' + data[AjaxSelectShopValue].ShopUserName + '</option>'
            $("#Selectshop").append(AjaxSsll)
        }
    }
}
//url 获取产品
function geturlfs(urlvalues) {
    if (urlvalues.includes('.com')) {
        $.ajax({
            method: "POST",
            url: '/sell/productinfo',
            data: {
                getUrl: urlvalues
            },
            success: function (data, status) {
            	console.log(data)
                if (data !== null) {
                    $("#SubSelectproduct").empty()
                    var AjaxSsll = '<option value=' + data.SellProductId + '>' + data.ProductId + ' - ' + JSON.parse(
                        data.Details).name + '</option>'
                    $("#SubSelectproduct").append(AjaxSsll)
                    // refresh()
                }
            }})
    }}

function urlgetproduct(data) {
    console.log(data)
    if (data !== 0) {
        $(document).ready(function () {
            $.ajax({
                method: "POST",
                url: '/sell/getproduct',
                data: {
                    shopid: data
                },
                success: function (data, status) {
                    // Call this function on succes
                    if (data !== null) {
                        $("#SubSelectproduct").empty()
                        $("#SubSelectproduct").append("<option value='0'>选择产品</option>")
                        for (var N in data) {
                            var AjaxSsll = '<option value=' + data[N].SellProductId + '>' + data[N].ProductId +
                                ' - ' + JSON.parse(data[N].Details).name + '</option>'
                            $("#SubSelectproduct").append(AjaxSsll)
                        }
                    }
                }
            })
        })
    }
}

function urlgetproductid(data) {
    console.log(data)
    if (data !== 0) {
        $.ajax({
            method: "POST",
            url: '/sell/getproductid',
            data: {
                SellProductId: data
            },
            success: function (data, status) {
                ProductSetInfo(data)
            }
        })

    }
}

function ProductSetInfo(data) {
    //$("#productinfoimg").attr('src',JSON.parse(data.Details).mainImage[0]);
    $("#productinfoID").attr('value', data.SellProductId);
    $("#productinfoplatformID").attr('value', data.ProductId);
    $("#infoplatform").attr('value', data.ShopSort);
    $("#infoproduct").attr('value', JSON.parse(data.Details).name);
}

//manager view 获取任务表 sellTaskManager.ejs
function ajaxGetTaskList(sort,shopId,productId,page,pageNum,TimeStart,TimeEnd){
    console.log('sort:'+sort+'shopId:'+shopId+'productId:'+productId+'page:'+page+'pageNum:'+pageNum+'TimeStart:'+TimeStart+'TimeEnd:'+TimeEnd);
    //任务属性、店铺、产品、页数、时间1和2
    $.ajax({
        method: "get",
        url: "/sell/tasklist",
        data: {
            sort: sort,
            shopId: shopId,
            productId:productId,
            TimeStart: TimeStart,
            TimeEnd: TimeEnd,
            page: page,
            pageNum: pageNum
        },
        success: function (data, status) {
            console.log(data)
            ajaxGetTaskListView(data)
            ajaxGetTaskListNumView(data[data.length-1],page,pageNum)
        }
    })
}




//任务页面按钮
function ajaxGetTaskListNumView(data,page,pageNum){
    //console.log('data:'+data+'page:'+page+'pageNum:'+pageNum)
    let totalPage = parseInt(data/pageNum)+1
    //console.log(totalPage)
    $("#pagination").empty()
    let pageview = ''
    if((page-1)<=totalPage && (page-1)>0){
        pageview = pageview +`<li class="paginate_button "><a onclick='ClickAjaxGetTaskList(`+(page-1)+`)'>上一页</a></li>`
    }
    if((page-2)<=totalPage && (page-2)>0){
        pageview = pageview +`<li class="paginate_button "><a onclick='ClickAjaxGetTaskList(`+(page-2)+`)'>`+(page-2)+`</a></li>`
    }
    if((page-1)<=totalPage && (page-1)>0){
        pageview = pageview +`<li class="paginate_button "><a onclick='ClickAjaxGetTaskList(`+(page-1)+`)'>`+(page-1)+`</a></li>`
    }
    if(page<=totalPage && page>0){
        pageview = pageview +`<li class="paginate_button active" id = 'nowpage' value=`+page+` ><a onclick='ClickAjaxGetTaskList(`+page+`)'>`+page+`</a></li>`
    }
    if((page+1)<=totalPage){
        pageview = pageview +`<li class="paginate_button "><a onclick='ClickAjaxGetTaskList(`+(page+1)+`)'>`+(page+1)+`</a></li>`
    }
    if((page+2)<=totalPage){
        pageview = pageview +`<li class="paginate_button "><a onclick='ClickAjaxGetTaskList(`+(page+2)+`)'>`+(page+2)+`</a></li>`
    }
    if((page+1)<=totalPage){
        pageview = pageview +`<li class="paginate_button "><a onclick='ClickAjaxGetTaskList(`+(page+1)+`)'>下一页</a></li>`
    }
    $("#pagination").append(pageview)
}

//manager view 获取任务表 sellTaskManager.ejs 给页面加数据
function ajaxGetTaskListView(data){
        var Details;
        $("#taskContainer").empty()
        for(var x=0;data.length-1>x;x++){
            let button_body='';
            Details = JSON.parse(data[x].Details)
            let front_body = `<div class="taskCell"><div class="title clearfix"><span class="shop floatLeft mr-20 ml10">店铺：<span>`+data[x].ShopSort+` - `+ data[x].ShopUserName +`</span></span><span class="taskNo floatLeft mr-4">编号：<span>`+ data[x].BuyTaskId +`</span>
            </span><span class="floatRight mr-8">状态：
                        <span class="FINISHED">`+data[x].BuyTaskState+`</span>
                        </span>
                        <span class="floatRight mr-8">
                        创建时间：
                        <span>`+data[x].BuyTaskCreateTime+`</span>
                        </span>
                        <span class="floatRight mr-8">
                        任务类型：
                        <span>`+data[x].BuyTaskState+`</span>
                        </span>
                    </div>
                    <div class="body">
                        <div class="wrq_task_list" style="height:auto"> 
                            <table class="normTable">
                                <thead>
                                    <tr>
                                        <td width="65%"></td>
                                        <td width="5%"></td>
                                        <td width="20%"></td>
                                        <td width="10%"></td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style="text-align:left;">
                                            <div style="wight:100px;float:left;margin-right:10px;"><img height="100px" width="100px" src="`+ Details.mainImage[0]+`"></div>
                                            <span style="height:100px">`+Details.name+`</span><br>
                                            <span>订单编号：<text class="doing">`+data[x].PlatFormOrderId+`</text></span><br>
                                            <span style="height:100px">单价：￥<text class="doing">`+data[x].BuyMoney+`</text> </span><span> 关键词：<text>`+data[x].KeyWord+`</text></span<br>
                                        </td>
                                        <td style="text-align:left;">
                                            <em class="cap"><span>-</span></em>

                                        </td>
                                        <td style="text-align:left;">
                                            <em class="cap">账号：<span class="doing">`+data[x].PlatFormUserName+`</span></em>
                                        </td>
                                        <td class="doing">`
            if(data[x].BuyTaskState===0){
                button_body = `<Text>关闭</Text>`
            }else if(data[x].BuyTaskState===1){
                button_body = `<Text>完成</Text>`
            }else if(data[x].BuyTaskState===2){
                button_body = `<Text>等待付款</Text>`
            }else if(data[x].BuyTaskState===3){
                button_body = `
            <a class="btnRepublish stdColorButton" href="javascript:;" id=`+data[x].BuyTaskId+` onclick="SellTaskState3Verify(this.id)">确认发货</a>
            <input class="btnRepublish stdColorButton" href="javascript:;"  id=`+data[x].BuyTaskId+` value="退回修改" onclick="document.getElementById('SellTaskState3Refuse').style.display='block';document.getElementById('SellTaskState3RefuseButton').value=this.id;">
            <a class="btnRepublish stdColorButton" href="javascript:;" id=`+data[x].BuyTaskId+` onClick="document.getElementById('SellerCloseTask').style.display='block';document.getElementById('SellerCloseTaskButton').value=this.id">关闭试用</a>
            `
            }else if(data[x].BuyTaskState===4){
                button_body = `<a class="btnRepublish stdColorButton" href="javascript:;" id=`+data[x].BuyTaskId+` onclick ="SellTaskState3Verify(this.id)">确认发货</a>
                               <a class="btnRepublish stdColorButton" href="javascript:;" id=`+data[x].BuyTaskId+` onclick="document.getElementById('SellerCloseTask').style.display='block';document.getElementById('SellerCloseTaskButton').value=this.id">关闭试用</a>`
            }else if(data[x].BuyTaskState===5){
                button_body = `<Text>等待收货</Text><br><a class="btnRepublish stdColorButton" href="javascript:;" id=`+data[x].BuyTaskId+` onclick="document.getElementById('SellerCloseTask').style.display='block';document.getElementById('SellerCloseTaskButton').value=this.id">关闭试用</a>`
            }else if(data[x].BuyTaskState===6){
                button_body = `<a class="btnRepublish stdColorButton" href="javascript:;" id=`+data[x].BuyTaskId+` onclick ="SellTaskState6Verify(this.id)">审核通过</a>
                               <a class="btnRepublish stdColorButton" href="javascript:;" id=`+data[x].BuyTaskId+` onclick="document.getElementById('SellTaskState6Refuse').style.display='block';document.getElementById('SellTaskState6RefuseButton').value=this.id">驳回修改</a>
                               <a class="btnRepublish stdColorButton" href="javascript:;" id=`+data[x].BuyTaskId+` onclick="document.getElementById('SellerCloseTask').style.display='block';document.getElementById('SellerCloseTaskButton').value=this.id">关闭试用</a>`
            }else if(data[x].BuyTaskState===7){
                button_body = `<a class="btnRepublish stdColorButton" href="javascript:;" id=`+data[x].BuyTaskId+` onclick ="SellTaskState6Verify(this.id)">审核通过</a>
                               <a class="btnRepublish stdColorButton" href="javascript:;" id=`+data[x].BuyTaskId+` onclick="document.getElementById('SellerCloseTask').style.display='block';document.getElementById('SellerCloseTaskButton').value=this.id">关闭试用</a>`
            }

            let end_body = `</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>`
            let AllBody= front_body+button_body+end_body
            $("#taskContainer").append(AllBody)
    }
}


//获取任务页面
function ajaxGetCommentList(sort,shopId,productId,page,pageNum,TimeStart,TimeEnd){
    //console.log('sort:'+sort+'shopId:'+shopId+'productId:'+productId+'page:'+page+'pageNum:'+pageNum+'TimeStart:'+TimeStart+'TimeEnd:'+TimeEnd);
    //任务属性、店铺、产品、页数、时间1和2
    $.ajax({
        method: "get",
        url: "/sell/taskcommentlist",
        data: {
            sort: sort,
            shopId: shopId,
            productId:productId,
            TimeStart: TimeStart,
            TimeEnd: TimeEnd,
            page: page,
            pageNum: pageNum
        },
        success: function (data, status) {
            console.log(data)
            ajaxGetCommentListView(data)
            ajaxGetTaskListNumView(data[data.length-1],page,pageNum)
        }
    })
}

//ajax读取好评列表加入详情页
function ajaxGetCommentListView(data){
        var Details;
        $("#taskContainer").empty()
        for(var x=0;data.length-1>x;x++){
            img = JSON.parse(data[x].BuyTaskCommentImg)
            Details = JSON.parse(data[x].Details)
            var AjaxSsll = `<div class="taskCell"><div class="title clearfix"><span class="shop floatLeft mr-20 ml10">店铺：<span>`+data[x].ShopSort+` - `+ data[x].ShopUserName +`</span></span><span class="taskNo floatLeft mr-4">编号：<span>`+ data[x].TaskCommentId +`</span>
            </span><span class="floatRight mr-8">状态：
                        <span class="FINISHED">`+data[x].TaskCommentState+`</span>
                        </span>
                        <span class="floatRight mr-8">
                        创建时间：
                        <span>`+data[x].CommentCreateTime+`</span>
                        </span>
                        <span class="floatRight mr-8">
                        任务类型：
                        <span>`+data[x].BuyTaskCommentEvent+`</span>
                        </span>
                    </div>
                    <div class="body">
                        <div class="wrq_task_list" style="height:auto"> 
                            <table class="normTable">
                                <thead>
                                    <tr>
                                        <td width="65%"></td>
                                        <td width="5%"></td>
                                        <td width="20%"></td>
                                        <td width="10%"></td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style="text-align:left;">
                                            <div style="wight:100px;float:left;margin-right:10px;"><img height="100px" width="100px" src="`+ Details.mainImage[0]+`"></div>
                                            <div style="wight:100px;float:left;margin-right:10px;"><img height="100px" width="100px" src="`+ img[0]+`"></div>
                                            <span style="height:100px">`+data[x].BuyTaskCommentText+`</span><br>
                                            <span>订单编号：<text class="doing"></text></span><br>
                                            <span style="height:100px">单价：￥<text class="doing"></text> </span><span> 关键词：<text></text></span<br>
                                        </td>
                                        <td style="text-align:left;">
                                            <em class="cap"><span>-</span></em>

                                        </td>
                                        <td style="text-align:left;">
                                            <em class="cap">账号：<span class="doing"></span></em>
                                        </td>
                                        <td class="doing">
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>`
            $("#taskContainer").append(AjaxSsll)
    }
}

//gettoken
function urlGetlToken() {
    $(document).ready(function () {
        $.ajax({
            method: "get",
            url: '/m/qntoken',
            success: function (data, status) {
                document.getElementById("token").value = data;
            }
        })
    })
}

//读取随机数
function randomIntFromInterval(min, max) {
    let result = Math.floor(Math.random() * (max - min + 1) + min);
    if (result < min) {
        result = min;
    } else if (result > max) {
        result = max;
    }
    return result
}

//七牛 上传图片
function clickqiniu(id) {
    var number = /[1-9]/.exec(id)[0]
    var Qiniu_UploadUrl = "https://up-z2.qiniup.com";
    var progressbar = $("#progressbar");
    var token = $("#token").val();
    //普通上传
    var Qiniu_upload = function (f, token, key) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', Qiniu_UploadUrl, true);
        var formData, startDate;
        formData = new FormData();
        formData.append('key', key);
        formData.append('token', token);
        formData.append('file', f);
        var taking;
        xhr.upload.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
                var nowDate = new Date().getTime();
                taking = nowDate - startDate;
                var x = (evt.loaded) / 1024;
                var y = taking / 1000;
                var uploadSpeed = (x / y);
                var formatSpeed;
                if (uploadSpeed > 1024) {
                    formatSpeed = (uploadSpeed / 1024).toFixed(2) + "Mb\/s";
                } else {
                    formatSpeed = uploadSpeed.toFixed(2) + "Kb\/s";
                }
                //图片上传值
                var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                console.log(percentComplete + 'id' + id)
                if (percentComplete === 100) {
                    url = 'http://img.zhess.com/' + key
                    console.log('done 100' + id + url)
                    document.getElementById('img' + number).src = url;
                    document.getElementById('but' + number).value = url;
                }
            }
        }, false);

        xhr.onreadystatechange = function (response) {
            if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != "") {
                var blkRet = JSON.parse(xhr.responseText);
                console && console.log(blkRet);
            } else if (xhr.status != 200 && xhr.responseText) {

            }
        };
        startDate = new Date().getTime();
        $("#progressbar").show();
        xhr.send(formData);
    };

    if ($("#" + id)[0].files.length > 0) {
        var key = new Date().getTime() + '' + randomIntFromInterval(10000, 99999) + '.jpg'
        Qiniu_upload($("#" + id)[0].files[0], token, key);
    } else {
        console && console.log("form input error");
    }
}

//按钮费用统计
function gettaskvalues() {
    var event_value = document.getElementsByName('event')
    var event_valueL = event_value.length
    var eventGetValue;
    do {
        event_valueL -= 1
        if (event_value[event_valueL].checked === true) {
            eventGetValue = event_value[event_valueL].value
        }
    } while (event_valueL > 0)
    var statisticalBuyPrice = document.getElementById('buyPrice').value //产品单价
    var statisticalbuyNum = document.getElementById('buyNum').value //拍的件数
    var statisticalhuabeiId = document.getElementById('huabeiId').checked //是否花呗

    //定单笔数
    var statisticalorderNumber = document.getElementsByName('orderNumber') //关键词订单数
    var statisticalorderNumberArray = 0
    var statisticalorderNumbervalues = statisticalorderNumber.length
    statisticalorderNumberArray = 0
    do {
        statisticalorderNumbervalues -= 1
        if (statisticalorderNumber[statisticalorderNumbervalues].valueAsNumber > 0) {
            statisticalorderNumberArray += statisticalorderNumber[statisticalorderNumbervalues].valueAsNumber
        }
    } while (statisticalorderNumbervalues > 0)
    var taskbasemoney1 = '' // 押金公式
    var taskbasemoney2 = '' // 总押金总计
    var taskmoney1 = '' //买家试用费
    var taskmoney2 = '' //买家试用费
    var huabeiId0 = ''
    var taskhuabei1 = '' //花呗号
    var taskhuabei2 = '' //花呗号
    var taskAI1 = '' //智能黑号限制
    var taskAI2 = '' //智能黑号限制
    var totalFee = '' //总费用
    if (statisticalBuyPrice > 0 || statisticalbuyNum > 0) {
        taskbasemoney1 = statisticalBuyPrice + '元 * ' + statisticalbuyNum + '件 * ' + statisticalorderNumberArray +
            '笔'
    }
    document.getElementById('taskbasemoney1').innerHTML = taskbasemoney1;
    if (statisticalorderNumber > 0 || statisticalorderNumberArray > 0 || statisticalBuyPrice > 0) {
        taskbasemoney2 = statisticalBuyPrice * statisticalorderNumberArray * statisticalbuyNum
        document.getElementById('taskbasemoney2').innerHTML = taskbasemoney2;
    }
    //定单笔数
    if (document.getElementById('huabeiId').checked === false) {
        huabeiId0 = 0
    } else {
        huabeiId0 = 2
    }
    taskhuabei1 = huabeiId0 + ' *' + statisticalorderNumberArray + '笔'
    taskhuabei2 = huabeiId0 * statisticalorderNumberArray
    //买家试用费
    //买家试用费
    if (eventGetValue === '1') {
        taskmoney1 = (parseInt((statisticalBuyPrice * statisticalbuyNum) / 100) + 7) + '元 *' +
            statisticalorderNumberArray + '笔'
        taskmoney2 = (parseInt((statisticalBuyPrice * statisticalbuyNum) / 100) + 7) * statisticalorderNumberArray

    } else if (eventGetValue === '2') {
        taskmoney1 = 0 + '元 *' + statisticalorderNumberArray + '笔'
        taskmoney2 = 0
    }
    taskAI1 = '2 * ' + statisticalorderNumberArray + '笔'
    taskAI2 = 2 * statisticalorderNumberArray
    totalFee = taskAI2 + taskmoney2 + taskhuabei2 + taskbasemoney2
    document.getElementById('taskmoney1').innerHTML = taskmoney1;
    document.getElementById('taskmoney2').innerHTML = taskmoney2;
    document.getElementById('taskhuabei1').innerHTML = taskhuabei1;
    document.getElementById('taskhuabei2').innerHTML = taskhuabei2;
    document.getElementById('taskAI1').innerHTML = taskAI1;
    document.getElementById('taskAI2').innerHTML = taskAI2;
    document.getElementById('totalFee').innerHTML = totalFee;
}
