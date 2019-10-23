const Subscription = require('egg').Subscription;
class UpdateWeChatToken extends Subscription {
  static get schedule() {
    return {
      interval: '2h', // 1 分钟间隔
      type: 'worker', // 指定所有的 worker 都需要执行
      immediate: true
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    let res = await this.ctx.curl('https://api.weixin.qq.com/cgi-bin/token', {
      data: {
        grant_type: 'client_credential',
        appid: this.config.weChat.appId,
        secret: this.config.weChat.appSecret
      },
      dataType: 'json'
    });
    // console.log(11)
    console.log(res);
    this.app.cache.accessToken = res.data.access_token;
    res = await this.ctx.curl('https://api.weixin.qq.com/cgi-bin/ticket/getticket', {
      data: {
        access_token: this.app.cache.accessToken,
        type: 'jsapi'
      },
      dataType: 'json'
    });
    // console.log(111111)
    console.log(res);
    this.app.cache.jsApiTicket = res.data.ticket;
  }
}

module.exports = UpdateWeChatToken;
