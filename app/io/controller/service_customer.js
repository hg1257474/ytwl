module.exports = app => {
  class Controller extends app.Controller {
    // args [end]
    // just can pull old messages
    // if initial page pull start should be 0 else should be the message index end
    async pull() {
      const {ctx}=this
      const customer=app.sessions.get(ctx.handshake.query.sessionId)
      const services = [];
      let end=customer.servicing.pointer
      let counter=0
      while(counter<20&&end>-1){
        const service=customer.entity.services[end]
        const chat = await this.ctx.model.Chat.findById(service.chatId).exec();
        services.push([chat.service,chat.createdAt,service.status,service.chatId])
        end--
        counter++
      }
      customer.servicing.pointer=end
      ctx.args[0](services)
    }
    async disconnect(){
      app.sessions.get(this.ctx.socket.handshake.query.sessionId).servicing = undefined;
    }
  }
  return Controller;
};
