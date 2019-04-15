const Subscription = require("egg").Subscription;
const sha1=require('js-sha1')
class UpdateWeixinToken extends Subscription {
  static get schedule() {
    return {
      interval: "2h", // 1 分钟间隔
      type: "worker", // 指定所有的 worker 都需要执行
      immediate: true,
      env: ["production", "development"]
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const res = await this.ctx.curl("http://www.api.com/cache", {
      dataType: "json"
    });
    this.ctx.app.cache = res.data;
    // 示例：启动的时候去读取 https://registry.npm.taobao.org/egg/latest 的版本信息
    let access_token = await app.curl(
      "https://api.weixin.qq.com/cgi-bin/token",
      {
        dataType: "json",
        data: {
          grant_type: "client_credential",
          appid: "wx7ade4268e3af1061",
          secret: "4b3d437e3ee8afb769dc8ddab800aa22"
        }
      }
    );
      console.log(Object.keys(access_token))
      access_token=access_token.data.access_token
      console.log(access_token)
    let jsapi_ticket = await app.curl(
      "https://api.weixin.qq.com/cgi-bin/ticket/getticket",
      {
        dataType: "json",
        data: {
          access_token,
          type: "jsapi"
        }
      }
    );
    jsapi_ticket=jsapi_ticket.data.ticket
    const noncestr = "dsdsdsdsd23123";
    const timestamp = 45415612313;
    const url = "http://192.168.0.29:3000/";
    console.log(jsapi_ticket);
      const temp=`jsapi_ticket=${jsapi_ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`
    const target="jsapi_ticket=LIKLckvwlJT9cWIhEQTwfNhwWQr_5N8wd0GLqyz8EKNMVvTmu34MbcHRBXCqxQQFP1lGIWTTjVzhivjRcOnwHQ&noncestr=dsdsdsdsd23123&timestamp=4541561231&url=http://192.168.0.29:3000/"
    console.log(temp)
    console.log(target)
    console.log(temp===target)
    let signature2=sha1(target)
    let signature=sha1(temp)
    console.log(signature2)
    console.log("Egg latest version: %s", signature);
  }
}

module.exports=UpdateWeixinToken