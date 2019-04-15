module.exports = function(app) {
  // [chatId , sessionId , formId]
  return async function(ctx, next) {
    const { objectIdEqual: oIdEqual } = app.methods;
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log(ctx.handshake.query);
    const body = JSON.parse(decodeURIComponent(ctx.handshake.query.cookie));
    console.log(body)
    // console.log(query);
    const user = app.sessions.get(body.sessionId);
    if (!user) {
      ctx.disconnect();
      return;
    }
    const chat = await ctx.model.Chat.findById(body.chatId).exec();
    const chatId = chat._id.toString();
    user.chatting = {
      socket: ctx.socket,
      chatId,
      pointer: chat.messages.length
    };
    console.log(user.chatting)
    if (
      !user.entity.services.find((value, index, array) => {
        if (value.chatId === chatId) {
          array[index].formId = body.formId;
          return true;
        }
      })
    ) {
      chat.servicerId = user.entity._id;
      for (let message of chat.messages) {
        if (oIdEqual(message.senderId, chat.customerId))
          message.receiverId = user._id;
      }
      chat.messages.push({
        type: 4,
        index: chat.messages.length,
        receiverId: chat.customerId,
        content: {
          notify: `客服${user.entity.basic.nickname}为您服务`
        }
      });
      await chat.save();
      user.entity.services.push({
        chatId,
        formId: body.formId,
        status: "沟通中"
      });
      const group = await ctx.model.NewService.findOne().exec();
      // console.log(group)
      group.content.splice(
        group.content.findIndex(value => oIdEqual(value._id, body.chatId)),
        1
      );
      await group.save();
    }
    await user.entity.save();
    await next();
  };
};
