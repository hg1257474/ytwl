module.exports = app => {
  class Controller extends app.Controller {
    // args [end cb]
    // just can pull old messages
    // if initial page pull start should be 0 else should be the message index end
    async pull() {
      const { ctx } = this;
      console.log(ctx.handshake.query);
      const body = JSON.parse(decodeURIComponent(ctx.handshake.query.cookie));
      console.log(body);
      console.log(11);
      const user = app.sessions.get(body.sessionId);
      const chat = await this.ctx.model.Chat.findById(body.chatId).exec();
      const end = user.chatting.pointer;
      console.log(user);
      if (end === -1) {
        this.ctx.args[0]("nothing");
        return;
      } else ctx.args[0](user.entity.privilege);
      const start = end - 20 > -1 ? end - 20 : 0;
      console.log(start, end);
      let range = [start, end];
      console.log(range);
      await this.service.chat.push(
        chat,
        range,
        user.entity.privilege ? "servicer" : "customer",
        () => {
          user.chatting.pointer = start;
        }
      );
    }
    // args [message , cb]
    async push() {
      const {
        args: [message, cb]
      } = this.ctx;
      const { ctx } = this;
      const body = JSON.parse(decodeURIComponent(ctx.handshake.query.cookie));
      const { objectIdEqual: oIdEqual } = app.methods;
      const user = app.sessions.get(body.sessionId).entity;
      const chat = await this.ctx.model.Chat.findById(body.chatId).exec();
      let receiverId = oIdEqual(user._id, chat.customerId)
        ? chat.servicerId
        : chat.customerId;
      let index = chat.messages.length;
      if (message.type === 1)
        message.thumbnail = await app.methods.getThumbnail(message.data);
      let newMessage = {
        type: message.type,

        content: message,
        index,
        senderId: user._id,
        hasRead: false,
        receiverId
      };
      delete newMessage.content.type;
      chat.messages.push(newMessage);
      await chat.save();
      if (cb) cb();
      await this.service.chat.push(chat, [index , index+1], "all", "新消息");
    }
    async disconnect() {
      console.log("disconnect");
      console.log(this.ctx.socket.handshake.query);
      const body = JSON.parse(
        decodeURIComponent(this.ctx.socket.handshake.query.cookie)
      );
      app.sessions.get(body.sessionId).chatting = undefined;
    }
  }
  return Controller;
};
