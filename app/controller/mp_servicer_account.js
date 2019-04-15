const tSessions = {};
module.exports = app => {
  class Controller extends app.Controller {
    //  POST js_code sessionId
    async login() {
      const {body}=this.ctx.request
      const config = app.config.servicerMiniProgram;
      // console.log("@@")
      // console.log(body)
      if (
        body.sessionId &&
        app.caches.getSession(undefined,body.sessionId)
      ) {
        this.ctx.body = "already";
        return;
      }
      const res = await app.curl(
        `https://api.weixin.qq.com/sns/jscode2session?appid=${
          config.appId
        }&secret=${config.secret}&js_code=${
          body.js_code
        }&grant_type=authorization_code`,
        {
          dataType: "json"
        }
      );
      // await this.ctx.model.User.deleteMany().exec()
      // console.log(res)
      // console.log(res)
      const openId = res.data.openid;
      // console.log(openId)
      const servicer = await this.ctx.model.Servicer.findOne({ openId }).exec();
      // console.log(servicer)
      if (servicer) {
        if (app.methods.isAvatarValid(servicer.avatar))
          this.ctx.body = app.caches.addSession("servicer",servicer);
        else {
          const tSessionId = app.methods.getUniqueId();
          tSessions[tSessionId] = { servicer };
          this.ctx.body = {tSessionId };
        }
      } else {
        const tSessionId = app.methods.getUniqueId();
        tSessions[tSessionId] = { openId };
        this.ctx.body = {isNeedRegister:true,tSessionId} ;
      }

      // console.log(user);
      // console.log(11);
      // this.ctx.body = user ? app.caches.addSession(user) : { openId };
    }
    // POST accountSessionId userName password
    async register() {
      // console.log(this.ctx.request.body);
      const {body} = this.ctx.request;
      const servicer = await this.ctx.model.Servicer.findOne({
        userName: body.userName,
        password: body.password
      }).exec();
      if (servicer) {
        servicer.openId =tSessions[body.tSessionId].openId;
        await servicer.save();
        tSessions[body.tSessionId].servicer=servicer
        // console.log(111);
        // console.log(servicer)
        this.ctx.body = "update";
      } else this.ctx.body = "error";
    }
    // POST accountSessionId avatar nickName
    async update() {
      const { body } = this.ctx.request;
      // console.log(body)
      const servicer = tSessions[body.tSessionId].servicer
      // console.log(servicer)
      servicer.avatar = body.avatar;
      servicer.nickName = body.nickName;
      servicer.save();
      this.ctx.body = app.caches.addSession("servicer",servicer);
    }
  }
  return Controller;
};
