module.exports = function(app) {
  //  sessionId
  return async function(ctx, next) {
    const customer = app.sessions.get(ctx.query.sessionId);
    if (!customer) {
      ctx.disconnect();
      return;
    }
    const socket = ctx.socket;
    socket.toJSON = () => "socket";
    customer.servicing = {
      socket,
      pointer: customer.entity.services.length-1  // push client's services's start
    };
    await next();
  };
};
