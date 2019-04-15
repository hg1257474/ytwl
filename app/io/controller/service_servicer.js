module.exports = app => {
  class Controller extends app.Controller {
    // args [end]
    // just can pull old messages
    // if initial page pull start should be 0 else should be the message index end
    async pull() {
      const {ctx}=this
      const servicer = app.sessions.get(ctx.handshake.query.sessionId);
      const services = [];
      if (servicer.entity.privilege.canAssignService) {
        const group = await this.ctx.model.NewService.findOne().exec();
        for (let newService of group.content)
          services.push([
            newService.service,
            newService.date,
            "新服务",
            newService._id
          ]);
      }
      let end = servicer.servicing.pointer;
      let counter = 0;
      while (counter < 20 && end > -1) {
        const service = servicer.entity.services[end];
        const chat = await this.ctx.model.Chat.findById(service.chatId).exec();
        services.push([
          chat.service,
          chat.createdAt,
          service.status,
          service.chatId
        ]);
        end--;
        counter++;
      }
      servicer.servicing.pointer = end;
      ctx.args[0](services);
    }
    async disconnect() {
      app.sessions.get(
        this.ctx.socket.handshake.query.sessionId
      ).servicing = undefined;
    }
  }
  return Controller;
};
