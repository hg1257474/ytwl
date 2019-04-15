module.exports = app => {
  class Controller extends app.Controller {
    // args [end]
    // just can pull old messages
    // if initial page pull start should be 0 else should be the message index end
    async instruction() {
      const {ctx}=this
      const instruction = this.ctx.args[0];
      const body = JSON.parse(decodeURIComponent(ctx.handshake.query.cookie));

      const servicer = app.sessions.get(body.sessionId);
      // console.log(sessionId, chatId, servicer);
      const chat = await this.ctx.model.Chat.findById(body.chatId).exec();
      switch (instruction) {
        case "getAvailableLawyers": {
          const lawyers = await this.ctx.model.Servicer.find(
            { "privilege.canProcessingService": true },
            "basic"
          ).exec();
          console.log(lawyers);
          this.ctx.args[1](
            lawyers.map(item => ({ id: item._id, name: item.basic.nickname }))
          );
          break;
        }
        case "initiatePayment": {
          const _order = {
            service: chat.service,
            totalFee: parseInt(this.ctx.args[1]),
            servicer: chat.servicerId,
            customer: chat.customerId,
            hasPaid: false
          };
          const order = new this.ctx.model.Order(_order);
          await order.save();
          const customer = await this.ctx.model.Customer
            .findById(chat.customerId)
            .exec();
          customer.orders.push(order);
          _order.openId = customer.openId;
          _order.spbillCreateIp = this.ctx.ip;
          _order.outTradeNo = order._id;
          _order.timestamp = parseInt(
            order.createdAt.getTime() / 1000
          ).toString();
          const result = await this.ctx.service.weChat.initiateMpPay(_order);
          const index = chat.messages.length;
          const message = {
            type: 3,
            senderId: chat.servicerId,
            receiverId: chat.customerId,
            hasRead: false,
            content: { linkType: 1, data: JSON.stringify(result) },
            index
          };
          chat.messages.push(message);
          chat.orderId = order._id;
          await chat.save();
          this.ctx.service.chat.push(
            chat,
            [index , index+1],
            "all",
            "请求支付"
          );
          break;
        }
        case "assignService": {
          const lawyer = await this.ctx.model.Servicer.findById(
            this.ctx.args[1]
          ).exec();
          lawyer.services.push({ chatId: body.chatId, status: "新服务" });
          chat.servicerId = lawyer._id;
          let index = 0;
          servicer.services.findIndex((value, _index) => {
            if (value.chatId === body.chatId) {
              index = _index;
              return index;
            }
          });
          servicer.services.splice(index, 1);
          await chat.save();
          await servicer.save();
          await lawyer.save();
          break;
        }
        case "finishService": {
          const index = chat.messages.length;
          const message = {
            type: 3,
            senderId: chat.servicerId,
            receiverId: chat.customerId,
            hasRead: false,
            content: { linkType: 1 },
            index
          };
          chat.messages.push(message);
          await chat.save();
          await this.ctx.service.chat.push(
            chat,
            [index, index+1],
            "all",
            "请求完结订单"
          );
        }
      }
    }
  }
  return Controller;
};
