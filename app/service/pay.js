const Service = require('egg').Service;

class ChatService extends Service {
  async new(totalFee, customerId, name, description, servicerId) {
    return new Promise(async resolve => {
      const {
        ctx: {
          model: { Order }
        }
      } = this;
      const order = new Order({
        totalFee,
        customerId,
        name,
        description,
        servicerId
      });
      await order.save();
      resolve(order._id);
    });
  }
}
module.exports = ChatService;
