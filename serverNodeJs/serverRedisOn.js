// var Redis = require("ioredis");
// var sub = new Redis(/** 连接信息 */);
// sub.once("connect", function() {
//     // 假设我们需要选择 redis 的 db，因为实际上我们不会去污染默认的 db 0
//     sub.select(1, function(err) {
//         if(err) process.exit(4);
//         sub.subscribe("foo", function() {
//             //... 订阅频道成功
//         });
//     });
// });

// // 监听从 `foo` 来的消息
// sub.on("message", function(channel, msg) {
//     console.log(channel, msg);
// });



const redis = require('redis');
const mysql = require('mysql');
const redis_config = {
    host: "xvcongcong.vicp.net",
    port: 6379,
    password: '1121redis',
    db: 1
}
function MysqlBD() {
    var connection = mysql.createConnection({
        user: 'root',
        password: '1121Mysql',
        host: 'xvcongcong.vicp.net',
        port: 3306,
        database: 'CrySystem'
    });
    return connection;
}


// 数据库连接
const redis_server = redis.createClient(redis_config); // 发布者
//redis_server.auth('1121redis', function(err,reply){console.log('server reply:'+reply)})
redis_server.on('connect', () => {
    console.log('redis_server connected')
})
redis_server.on('error', () => {
    console.log('error occured from redis_server')
})
//redis_server.set("stringKey", "stringVal", redis.print);
redis_server.get("stringKey", redis.print);
const redis_cli = redis.createClient(redis_config);
//redis_cli.auth('1121redis', function(err,reply){console.log('clientreply:'+reply)})
redis_cli.on('connect', () => {
    console.log("redis_cli connected")
})
redis_cli.on('error', () => {
    console.log("error occured from redis_cli")
})
// 编写一个接收到消息以后要执行的方法
let subscribeKey = "__keyevent@1__:expired";

redis_cli.once('connect', () => {
    redis_cli.subscribe(subscribeKey, () => {
        console.log("订阅成功");
    })
})
function SendTaskToRedis(key,time){
    redis_server.set(key,key,'EX',time)
}

function ChangerState(AutoChangeState,key){
    var objBDx = MysqlBD();
    let sqlStr='update BuyTask set BuyTaskId='+AutoChangeState+'where BuyTaskId='+key
    objBDx.query(sqlStr,function(error,returnValue) {
        if(error){
            return error
        }else if(returnValue){
            return returnValue
        }
    })
}


function GetMessage(channel, key,){
    console.log("接收到了推送")

    sql='select * from BuyTask where BuyTaskId='+key
    var objBD = MysqlBD();
    objBD.query(sql,function(error,mysqlValue) {
        if(mysqlValue){
            mysqlValue= mysqlValue[0]
            if(mysqlValue.BuyTaskState==0||mysqlValue.BuyTaskState==1){
                console.log('BuyTaskState=1')
            }else if(mysqlValue.AutoChangeState==1){
                console.log('AutoChangeState=1')
            }else{
                let ChangeStateValue = ChangerState(mysqlValue.AutoChangeState,key)
            }
        }else{
            console.log(error)
        }
    })
}

//redis_cli.on("message", SampleOnExpired);
redis_cli.on("message", GetMessage);
/*
1. 读取现在的任务，如果有生成任务清单
2. 插入redis数据库
3. 写sql update语句
*/


function GetMysqlTask(){
    var objBD = MysqlBD();
    objBD.query('select * from BuyTask',function(error,mysqlValue) {
        if (mysqlValue) {
            for(let x=0;x<mysqlValue.length;x++){
                if(mysqlValue[x].AutoChangeState===null || mysqlValue[x].BuyTaskState===0 || mysqlValue[x].BuyTaskState===1){
                    console.log('not changer')
                }else{
                    let nowDate = mysqlValue[x].AutoChangeTime - new Date()
                    if (nowDate <0){
                        nowDate = 1
                    }else{
                        nowDate = parseInt(nowDate/1000)
                    }
                    console.log(nowDate)
                    SendTaskToRedis(mysqlValue[x].BuyTaskId,nowDate)
                }
            }
        } else {
            console.log('error');
        }
    });
}


function CreateRedisTask(){

}
GetMysqlTask()


