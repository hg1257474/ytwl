const crypto = require("crypto");
module.exports = app => {
  class Controller extends app.Controller {
    // index chatId
    async doc() {
      const { index, chatId } = this.ctx.request.queries;
      const chat = await app.model.Chat.findById(chatId[0]).exec();
      const message=chat.messages[index[0]].content
      if(message.thumbnail) this.ctx.body={url:message.data,name:message.name}
      else this.ctx.body=message.data
    }

    async jsSdkConfig() {
      console.log("___________________________________________________");
      // const url = decodeURIComponent(this.ctx.request.queries.url[0]);
      console.log(this.ctx.request.queries.url[0])
      const url = "http://www.huishenghuo.net:3000/?"+this.ctx.request.queries.url[0];
      const debug = true;
      const jsApiList = ["previewImage"];
      const timestamp = parseInt(this.app.mongoose.now().getTime() / 1000);
      const nonceStr = this.app.methods.getUniqueId().slice(0, 16);
      const appId = this.config.weChat.appId;
      console.log(this.app.caches.getWeChatData());
      const jsApiTicket = this.app.caches.getWeChatData().jsApiTicket;
      const raw = `jsapi_ticket=${jsApiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
      console.log(raw);
      const signature = crypto
        .createHash("sha1")
        .update(raw)
        .digest("hex");
      console.log(signature);
      console.log("_________________________________________");
      this.ctx.body = {
        appId,
        timestamp,
        nonceStr,
        signature,
        jsApiList,
        debug
      };
    }
  }
  return Controller;
};
