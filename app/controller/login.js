("use strict");


module.exports = app => {
    class LoginController extends app.Controller {
          async index() {
            console.log(this.ctx.request.body.username)
            const LoginedMysql = await this.app.mysql.get('UserName', { UserName: this.ctx.request.body.username, PassWord: this.ctx.request.body.password });
            if (LoginedMysql === null){
                this.ctx.body = {message:'no'};
                console.log('LoginedMysql_null')
            } else  {
                const token = this.app.jwt.sign({ username: this.ctx.request.body.username}, this.app.config.jwt.secret);
                const tokenVerify = this.app.jwt.verify(token, this.app.config.jwt.secret);
                this.app.jwt.verify(token, this.app.config.jwt.secret, function(err, decoded) {
                    console.log(err)
                });
                let returnlog = 'token:' + token + 'tokenVerify :'+ JSON.stringify(tokenVerify)
                console.log(returnlog)
                this.ctx.body = {message:'yes',token:token};
            }
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
                          const row = {
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