("use strict");

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
            let BundleID = this.ctx.request.body.BundleID // e.g. com.learnium.mobile
            let BuildNumber = this.ctx.request.body.BuildNumber  // e.g. 89
            let AppVersion = this.ctx.request.body.AppVersion  // e.g. 1.1.0
            let DeviceName = this.ctx.request.body.DeviceName  // e.g. Becca's iPhone 6
            let UserAgent = this.ctx.request.body.UserAgent // e.g. Dalvik/2.1.0 (Linux; U; Android 5.1; Google Nexus 4 - 5.1.0 - API 22 - 768x1280 Build/LMY47D)
            let DeviceLocale = this.ctx.request.body.DeviceLocale // e.g en-US
            let DeviceCountry = this.ctx.request.body.DeviceCountry // e.g US
            let Timezone = this.ctx.request.body.Timezone // e.g America/Mexico_City
            let emulator = this.ctx.request.body.emulator // if app is running in emulator return true
            const LoginedMysql = await this.app.mysql.get('UserName', { UserName: this.ctx.request.body.username, PassWord: this.ctx.request.body.password });
            if (LoginedMysql === null){
                this.ctx.body = {state:1,message:'no'};
                console.log('LoginedMysql_null')
            }
            //check blackList
            if (LoginedMysql.Status==1){
                return this.ctx.body = {state:0,message:'blacklist'};
              }
            //check emulator
            if(emulator==true){
                //setting username status = 1
                //save emlatorList +usernameId
                return this.ctx.body = {state:0,message:'blacklist'};
            }
            let getMachineSql = await this.mysql.get('UserMachine', {UniqueID:UniqueID})
          if (getMachineSql){
              //如果账号不是设备原来用户
              if(getMachineSql.UserNameId !=LoginedMysql.UserNameId){
                  return this.ctx.body = {state:0,message:'blacklist'};
                  let row = {Status: 1}
                  let result = await this.app.mysql.update('UserMachine', row);
                  if (result.affectedRows === 1) {
                      return this.ctx.body = {state:0,message:'blacklist'};
                        }
                    }
          }else{
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
            this.ctx.body = {message:'yes',token:token};
        }
          async MobileLogin() {
              const LoginedMysql = await this.app.mysql.select('sms', { where:{MobileNumber: this.ctx.request.body.username }});//是否存在验证码
              if (LoginedMysql.length === 0){
                  await this.ctx.render('sellMobileLogin.ejs',{message:'请发验证码'})
              } else  {
                  if (LoginedMysql[LoginedMysql.length -1].Verify !== parseInt(this.ctx.request.body.VerifyCode)) {
                      await this.ctx.render('sellMobileLogin.ejs',{message:'验证码错误'})//验证码是否正确
                  } else if(LoginedMysql[LoginedMysql.length -1].MobileNumber !==this.ctx.request.body.username){
                      await this.ctx.render('sellMobileLogin.ejs',{message:'手机号不一致'})//验证码是否正确
                  }else {
                      // save mobile and password 保存密码
                      const GetId = await this.app.mysql.get('UserName',{UserName: LoginedMysql[LoginedMysql.length -1].MobileNumber})
                      if (GetId === null){
                          let row = {
                              UserName: LoginedMysql[LoginedMysql.length -1].MobileNumber,
                              PassWord: this.ctx.request.body.password
                          }
                          const createUser = await this.app.mysql.insert('UserName',row)
                          const GetNewUserId = await this.app.mysql.get('UserName',{UserName: LoginedMysql[LoginedMysql.length -1].MobileNumber})
                          const rowx = {
                              UserNameId: GetNewUserId.ID,
                              Balance: 0
                          }
                          const createUserB = await this.app.mysql.insert('FinancialBalance',rowx)
                          this.ctx.cookies.set('username', LoginedMysql[LoginedMysql.length -1].MobileNumber, { encrypt: true });
                          this.ctx.redirect('/sell')
                      } else {
                          const row = {
                              ID: GetId.ID,
                              PassWord: this.ctx.request.body.password
                          }
                          const result = await this.app.mysql.update('posts', row); // 更新 posts 表中的记录
                          if (result.affectedRows === 1) {
                              this.ctx.cookies.set('username', LoginedMysql[LoginedMysql.length -1].MobileNumber, { encrypt: true });
                              this.ctx.redirect('/sell')
                          } else {
                              await this.ctx.render('sellMobileLogin.ejs',{message:'密码更新错误，请联系管理员'})
                          }
                      }
                  }
              }
        }
    }
    return LoginController;
};