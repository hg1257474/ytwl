module.exports = app => {
  class Controller extends app.Controller {
    //  POST category
    async request() {
      const { ctx } = this;
      const { index, category } = this.ctx.request.body;
      if (index) {
        const customer = this.app.sessions.get(
          ctx.cookies.get('sessionId', { signed: false, encrypt: false })
        );
        const chat = await this.ctx.model.Chat.findById(customer.chatting.chatId).exec();
        const param = JSON.parse(chat.messages[index].content.data);
        const order = await this.ctx.model.Order.findById(chat.orderId).exec();
        this.ctx.body = {
          param,
          totalFee: order.totalFee,
          service: `${order.service.category}-${order.service.name}-${order.service.type}`
        };
      } else {
        const service = await app.model.Cache.findOne({
          type: 'payPage'
        }).exec();
        const customer = ctx.session.entity;
        const _order = {
          service: { category: service.payPage[category][1] },
          totalFee: service.payPage[category][0]
        };
        const order = new this.ctx.model.Order(_order);
        await order.save();
        customer.orders.push(order._id);
        await customer.save();
        _order.openId = customer.openId;
        _order.spbillCreateIp = this.ctx.ip;
        _order.outTradeNo = order._id;
        _order.timestamp = parseInt(order.createdAt.getTime() / 1000).toString();
        const result = await this.ctx.service.weChat.initiateMpPay(_order);
        this.ctx.body = result;
      }
    }

    async callback() {
      this.ctx.body = 'success';
      this.ctx.status = 200;
      const xml = await this.ctx.parseXml();
      console.log(xml);
      const result = xml.includes('<result_code><![CDATA[SUCCESS]]></result_code>');
      console.log(result);
      if (result) {
        const orderId = xml.split('<out_trade_no><![CDATA[')[1].split(']]></out_trade_no>')[0];
        console.log(orderId);
        const order = await this.ctx.model.Order.findById(orderId).exec();
        console.log(order);
        order.hasPaid = true;
        await order.save();
      }
    }
  }
  return Controller;
};
