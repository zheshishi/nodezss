("use strict");
async function BlackUserName(app,username_id){
    let BlackStateSql = 'update UserName SET Status=1 WHERE UserNameId='+username_id
    await app.mysql.query(BlackStateSql)
    }
module.exports = app => {
    class LoginController extends app.Controller {
          async Login() {
            let ip = this.ctx.request.body.ip
            let UniqueID = this.ctx.request.body.UniqueID
            let Manufacturer = this.ctx.request.body.Manufacturer  // e.g. Apple
            let Brand = this.ctx.request.body.Brand // e.g. Apple / htc / Xiaomi
            let Model = this.ctx.request.body.Model // e.g. iPhone 6
            let DeviceId = this.ctx.request.body.DeviceId  // e.g. iPhone7,2 / or the board on Android e.g. goldfish
            let SystemName = this.ctx.request.body.SystemName // e.g. iPhone OS
            let SystemVersion = this.ctx.request.body.SystemVersion  // e.g. 9.0
            let BundleId = this.ctx.request.body.BundleID // e.g. com.learnium.mobile
            let BuildNumber = this.ctx.request.body.BuildNumber  // e.g. 89
            let AppVersion = this.ctx.request.body.AppVersion  // e.g. 1.1.0
            let DeviceName = this.ctx.request.body.DeviceName  // e.g. Becca's iPhone 6
            let UserAgent = this.ctx.request.body.UserAgent // e.g. Dalvik/2.1.0 (Linux; U; Android 5.1; Google Nexus 4 - 5.1.0 - API 22 - 768x1280 Build/LMY47D)
            let DeviceLocale = this.ctx.request.body.DeviceLocale // e.g en-US
            let DeviceCountry = this.ctx.request.body.DeviceCountry // e.g US
            let Timezone = this.ctx.request.body.Timezone // e.g America/Mexico_City
            let emulator = this.ctx.request.body.emulator // if app is running in emulator return true
            let systemSort;
            if(SystemName==='IOS'||SystemName==='iOS'||SystemName==='ios'||SystemName==='IOS'||SystemName==='Ios'){
                  systemSort=1
            }else if(SystemName==='android'||SystemName==='Android'||SystemName==='ANDROID'){
                  systemSort=0
              }
            const LoginedMysql = await this.app.mysql.get('UserName', { UserName: this.ctx.request.body.username, PassWord: this.ctx.request.body.password });
            if (LoginedMysql == null){
                return this.ctx.body = {state:1,message:'no'};
            }
            //check blackList
            if (LoginedMysql.Status==1){
                return this.ctx.body = {state:0,message:'blacklist'};
              }
            //check emulator
            if(emulator==false){
                let UserEmulatorSql = 'INSERT INTO UserEmulator (UserNameId,ip) values('+LoginedMysql.UserNameId+',"'+ip+'")'
                let UserEmulatorSqlRun = await this.app.mysql.query(UserEmulatorSql)
                let row = await BlackUserName(this.app, LoginedMysql.UserNameId)
                return this.ctx.body = {state:0,message:'blacklist'};
            }
          let getMachineSql = await this.app.mysql.get('UserMachine', {UniqueID:UniqueID})
          if (getMachineSql){
                  //如果账号不是设备原来用户
                  if(getMachineSql.UserNameId !==LoginedMysql.UserNameId){
                      let row = await BlackUserName(this.app, getMachineSql.UserNameId)
                      let row1 = await BlackUserName(this.app, LoginedMysql.UserNameId)
                      let rowX = {
                          UserNameId: LoginedMysql.UserNameId,
                          UserMachineId:getMachineSql.UserMachineId,
                          ip: ip
                      }
                      let createUser = await this.app.mysql.insert('UserLoginOtherMachine',rowX)
                      return this.ctx.body = {state:0,message:'blacklist'};
                  }
          }else{


                  let rowX = {
                      UserNameId: LoginedMysql.UserNameId,
                      System: systemSort,
                      UniqueID:UniqueID,
                      Manufacturer:Manufacturer,
                      getModel:Model,
                      getDeviceId:DeviceId,
                      SystemName:SystemName,
                      SystemVersion:SystemVersion,
                      BundleId:BundleId,
                      BuildNumber:BuildNumber,
                      AppVersion:AppVersion,
                      DeviceName:DeviceName,
                      DeviceLocale:DeviceLocale,
                      DeviceCountry:DeviceCountry,
                      Timezone:Timezone,
                      ip:ip,
              }
              let createUser = await this.app.mysql.insert('UserMachine',rowX)
              //如果不存在，保存并记录
          }
            //搜索机器码是否存在，
            // 如果存在，判断是否是用户账号，
              // 如果不是用户账号（2个账号拉黑），保存在「共同登录的数据表」中。让他联系管理员
            // 如果不存在，保存并记录
            const token = this.app.jwt.sign({ username: this.ctx.request.body.username}, this.app.config.jwt.secret);
            const tokenVerify = this.app.jwt.verify(token, this.app.config.jwt.secret);
            this.app.jwt.verify(token, this.app.config.jwt.secret, function(err, decoded) {
                console.log(err)
            });
            let returnlog = 'token:' + token + 'tokenVerify :'+ JSON.stringify(tokenVerify)
            console.log(returnlog)
            this.ctx.body = {state:2,token:token};
        }
        async MobileLogin() {
            let ip = this.ctx.request.body.ip
            let UniqueID = this.ctx.request.body.UniqueID
            let Manufacturer = this.ctx.request.body.Manufacturer  // e.g. Apple
            let Brand = this.ctx.request.body.Brand // e.g. Apple / htc / Xiaomi
            let Model = this.ctx.request.body.Model // e.g. iPhone 6
            let DeviceId = this.ctx.request.body.DeviceId  // e.g. iPhone7,2 / or the board on Android e.g. goldfish
            let SystemName = this.ctx.request.body.SystemName // e.g. iPhone OS
            let SystemVersion = this.ctx.request.body.SystemVersion  // e.g. 9.0
            let BundleId = this.ctx.request.body.BundleID // e.g. com.learnium.mobile
            let BuildNumber = this.ctx.request.body.BuildNumber  // e.g. 89
            let AppVersion = this.ctx.request.body.AppVersion  // e.g. 1.1.0
            let DeviceName = this.ctx.request.body.DeviceName  // e.g. Becca's iPhone 6
            let UserAgent = this.ctx.request.body.UserAgent // e.g. Dalvik/2.1.0 (Linux; U; Android 5.1; Google Nexus 4 - 5.1.0 - API 22 - 768x1280 Build/LMY47D)
            let DeviceLocale = this.ctx.request.body.DeviceLocale // e.g en-US
            let DeviceCountry = this.ctx.request.body.DeviceCountry // e.g US
            let Timezone = this.ctx.request.body.Timezone // e.g America/Mexico_City
            let emulator = this.ctx.request.body.emulator // if app is running in emulator return true
            let systemSort;
            if(SystemName==='IOS'||SystemName==='iOS'||SystemName==='ios'||SystemName==='IOS'||SystemName==='Ios'){
              systemSort=1
            }else if(SystemName==='android'||SystemName==='Android'||SystemName==='ANDROID'){
              systemSort=0
            }
            let LoginedMysql = await this.app.mysql.select('sms', { where:{MobileNumber: this.ctx.request.body.username }});//是否存在验证码
            if (LoginedMysql.length === 0){
              return await this.ctx.render('sellMobileLogin.ejs',{state:1,message:'请发验证码'})
            }
            if (LoginedMysql[LoginedMysql.length -1].Verify !== parseInt(this.ctx.request.body.VerifyCode)) {
                return await this.ctx.render('sellMobileLogin.ejs',{state:1,message:'验证码错误'})//验证码是否正确
            } else if(LoginedMysql[LoginedMysql.length -1].MobileNumber !==this.ctx.request.body.username){
                return await this.ctx.render('sellMobileLogin.ejs',{state:1,message:'手机号不一致'})//验证码是否正确
            }
            // save mobile and password 保存密码
            let GetId = await this.app.mysql.get('UserName',{UserName: LoginedMysql[LoginedMysql.length -1].MobileNumber})
            if (GetId === null){
                  let row = {
                      UserName: LoginedMysql[LoginedMysql.length -1].MobileNumber,
                      PassWord: this.ctx.request.body.password
                  }
                  let createUser = await this.app.mysql.insert('UserName',row)
                  LoginedMysql = await this.app.mysql.get('UserName',{UserName: LoginedMysql[LoginedMysql.length -1].MobileNumber})
                  let rowx = {
                      UserNameId: LoginedMysql.UserNameId,
                      Balance: 0
                        }
                  const createUserB = await this.app.mysql.insert('FinancialBalance',rowx)
            } else {
              const row = {
                  UserNameId: GetId.UserNameId,
                  PassWord: this.ctx.request.body.password
              }
              const result = await this.app.mysql.update('UserName', row); // 更新 posts 表中的记录
                     }

            LoginedMysql = await this.app.mysql.get('UserName', { UserName: this.ctx.request.body.username, PassWord: this.ctx.request.body.password });
            if (LoginedMysql == null){
                return this.ctx.body = {state:1,message:'no'};
            }
            //check blackList
            if (LoginedMysql.Status==1){
                return this.ctx.body = {state:0,message:'blacklist'};
            }
            //check emulator
            if(emulator==false){
                let UserEmulatorSql = 'INSERT INTO UserEmulator (UserNameId,ip) values('+LoginedMysql.UserNameId+',"'+ip+'")'
                let UserEmulatorSqlRun = await this.app.mysql.query(UserEmulatorSql)
                let row = await BlackUserName(this.app, LoginedMysql.UserNameId)
                return this.ctx.body = {state:0,message:'blacklist'};
            }
            let getMachineSql = await this.app.mysql.get('UserMachine', {UniqueID:UniqueID})
            if (getMachineSql){
                //如果账号不是设备原来用户
                if(getMachineSql.UserNameId !==LoginedMysql.UserNameId){
                    let row = await BlackUserName(this.app, getMachineSql.UserNameId)
                    let row1 = await BlackUserName(this.app, LoginedMysql.UserNameId)
                    let rowX = {
                        UserNameId: LoginedMysql.UserNameId,
                        UserMachineId:getMachineSql.UserMachineId,
                        ip: ip
                    }
                    let createUser = await this.app.mysql.insert('UserLoginOtherMachine',rowX)
                    return this.ctx.body = {state:0,message:'blacklist'};
                }
            }else{
                let rowX = {
                    UserNameId: LoginedMysql.UserNameId,
                    System: systemSort,
                    UniqueID:UniqueID,
                    Manufacturer:Manufacturer,
                    getModel:Model,
                    getDeviceId:DeviceId,
                    SystemName:SystemName,
                    SystemVersion:SystemVersion,
                    BundleId:BundleId,
                    BuildNumber:BuildNumber,
                    AppVersion:AppVersion,
                    DeviceName:DeviceName,
                    DeviceLocale:DeviceLocale,
                    DeviceCountry:DeviceCountry,
                    Timezone:Timezone,
                    ip:ip,
                }
                let createUser = await this.app.mysql.insert('UserMachine',rowX)
                //如果不存在，保存并记录
            }
            //搜索机器码是否存在，
            // 如果存在，判断是否是用户账号，
            // 如果不是用户账号（2个账号拉黑），保存在「共同登录的数据表」中。让他联系管理员
            // 如果不存在，保存并记录
            const token = this.app.jwt.sign({ username: this.ctx.request.body.username}, this.app.config.jwt.secret);
            const tokenVerify = this.app.jwt.verify(token, this.app.config.jwt.secret);
            this.app.jwt.verify(token, this.app.config.jwt.secret, function(err, decoded) {
                console.log(err)
            });
            let returnlog = 'token:' + token + 'tokenVerify :'+ JSON.stringify(tokenVerify)
            console.log(returnlog)
            this.ctx.body = {state:2,token:token};

            // this.ctx.cookies.set('username', LoginedMysql[LoginedMysql.length -1].MobileNumber, { encrypt: true });
            // this.ctx.redirect('/sell')
          }
        }
    return LoginController;
};