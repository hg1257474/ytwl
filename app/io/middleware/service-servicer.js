module.exports = function(app) {
  //  sessionId
  return async function(ctx, next) {
    const { query } = ctx.handshake;
    const servicer = app.sessions.get(query.sessionId);

    if (!servicer) {
      ctx.disconnect();
      return;
    }
    const socket = ctx.socket;
    socket.toJSON = () => "socket";
    servicer.servicing = {
      socket,
      pointer: servicer.entity.services.length - 1 // push client's services's start
    };
    await next();
  };
};
