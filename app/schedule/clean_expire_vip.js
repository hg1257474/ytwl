const { Subscription } = require('egg');

class UpdateWeChatToken extends Subscription {
  static get schedule() {
    return {
      interval: '1d', // 1 分钟间隔
      type: 'worker', // 指定所有的 worker 都需要执行
      immediate: true
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const { ctx } = this;
    const res = await ctx.model.Customer.updateMany(
      { 'vip.expires': { $exists: true, $lte: new Date() } },
      { $unset: { vip: '' } }
    );
    console.log(res.n);
    console.log(res.nModified);
  }
}

module.exports = UpdateWeChatToken;
