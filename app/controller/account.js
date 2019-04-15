module.exports = app => {
  class Controller extends app.Controller {
    // PUT openId avatar nickname
    async basic() {
      const {
        ctx,
        ctx: {
          request: { body }
        }
      } = this;
      let user = await this.ctx.model.Customer.findOne({
        openId: body.openId
      }).exec();
      if (!user)
        user = await this.ctx.model.Servicer.findOne({
          'identity.openId': body.openId
        }).exec();
      user.basic = {
        shouldUpdate: false,
        nickname: body.nickname,
        avatar: body.avatar
      };
      await user.save();
      ctx.session = {
        entity: user,
        callback: sessionId =>
          ctx.cookies.set('sessionId', sessionId, {
            signed: false,
            encrypt: false
          })
      };
      if (user.vip) {
        let isAllInfo = false;
        for (let [key, value] of Object.entries(user.info)) {
          if (value && ['phone', 'weChat', 'dingTalk'].includes(key)) {
            isAllInfo = true;
            break;
          }
          if (!value && !['phone', 'weChat', 'dingTalk'].includes(key)) {
            isAllInfo = false;
            break;
          }
        }
        ctx.body = {
          vip: user.vip,
          isAllInfo
        };
      }
      ctx.status = 201;
    }
  }
  return Controller;
};
