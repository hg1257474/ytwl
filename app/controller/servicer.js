const path = require('path');
const fs = require('fs');
module.exports = app => {
  class Controller extends app.Controller {
    //  POST username password jsCode openId
    async lawyers() {
      this.ctx.body = await this.ctx.model.Servicer.find(
        { 'privilege.canProcessingService': true },
        { avatar: true, name: true, expert: true }
      )
        .limit(5)
        .exec();
    }

    async officialAccount() {
      const { ctx } = this;
      const result = await ctx.parseXml();
      if (result.includes('TEMPLATESENDJOBFINISH')) {
        ctx.body = 'success';
        return;
      }
      const openId = result.match(/<FromUserName><!\[CDATA\[(.+)\]\]><\/FromUserName>/)[1];
      const authorize = result.match(/<Content><!\[CDATA\[(.+)\]\]><\/Content>/)[1];
      const servicer = await ctx.model.Servicer.findOne({
        username: authorize.split('@')[0],
        password: authorize.split('@')[1]
      }).exec();
      if (servicer) {
        servicer.oAOpenId = openId;
        await servicer.save();
      }
      const res = `<xml>
  <ToUserName><![CDATA[${/openid=(.+)/.exec(ctx.request.href)[1]}]]></ToUserName>
  <FromUserName><![CDATA[${
    /ToUserName><!\[CDATA\[(.+)\]\]><\/ToUserName/.exec(ctx.xml)[1]
  }]]></FromUserName>
  <CreateTime>${Math.ceil(new Date().getTime() / 1000)}</CreateTime>
  <MsgType><![CDATA[text]]></MsgType>
  <Content><![CDATA[${servicer ? '您已成功绑定' : '账号或密码错误'}]]></Content>
</xml>`;
      console.log(res);
      // await ctx.service.weChat.pushMessage(openId, '/pages/index/index', 'Customer', 'newService', {
      //   first: { value: '有新的服务', color: '#000' },
      //   keyword1: { value: '合同咨询', color: '#111' },
      //   keyword2: {
      //     value: '2018年5月5日   11时22分33秒',
      //     color: '#222'
      //   },
      //   remark: { value: '请进入处理', color: '#333' }
      // });
      console.log(ctx.xml);
      ctx.body = res;
    }

    async login() {
      const { ctx } = this;
      if (
        !ctx.session.entity ||
        (ctx.query.identity === 'lawyer') !== !!ctx.session.entity.privilege.canProcessingService
      ) {
        const preRequire =
          ctx.query.identity === 'lawyer'
            ? { 'privilege.canProcessingService': true }
            : { 'privilege.canAssignService': true };
        const { Servicer } = ctx.model;
        const { body } = ctx.request;
        let servicer = null;
        if (body.jsCode) {
          const openId = await ctx.service.weChat.getOpenId('Servicer');
          servicer = await Servicer.findOne({ openId, ...preRequire }).exec();
          if (!servicer) {
            ctx.status = 401;
            ctx.body = openId;
            return 1;
          }
        } else {
          servicer = await Servicer.findOne({
            username: body.username,
            password: body.password,
            ...preRequire
          }).exec();
          if (!servicer) {
            ctx.status = 401;
            ctx.body = 'fail';
            return 1;
          }
          servicer.openId = body.openId;
          await servicer.save();
        }
        ctx.body = 'success';
        ctx.session = { entity: servicer };
      } else ctx.body = 304;
      return 0;
    }
  }
  return Controller;
};
