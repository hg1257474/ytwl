'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, io } = app;
  // router.get("/mpCache", controller.mpCache.getCache);
  //router.get("/", controller.home.index);
  //router.get("/backstage/servicer",controller.backstage.servicer.index)
  //router.get("/backstage/servicer/:id",controller.backstage.servicer.detail)
  router.get('/backstage/analysis', controller.backstage.analysis.index);
  router.post('/service/file', controller.service.file.index);
  router.get('/service/file', controller.service.file.index);
  router.put('/service/file', controller.service.file.index);
  router.get('/resource/:target/:id/:name', controller.other.resource);
  router.get('/backstage/conclusion', controller.backstage.conclusion.index);
  router.get('/servicer/official_account', controller.servicer.officialAccount);
  router.post('/servicer/official_account', controller.servicer.officialAccount);
  router.get('/backstage/customer', controller.backstage.customer.index);
  router.get('/backstage/order', controller.backstage.order.index);
  router.get('/backstage/servicer', controller.backstage.servicer.index);
  router.get('/backstage/servicer/:id', controller.backstage.servicer.myUpdate);
  router.post('/backstage/servicer/:id', controller.backstage.servicer.myUpdate);
  router.del('/backstage/servicer/:id', controller.backstage.servicer.myUpdate);
  router.put('/backstage/servicer/:id', controller.backstage.servicer.myUpdate);

  router.get('/backstage/service', controller.backstage.service.index);
  router.get('/resource_test/:id', controller.test.getFile);
  router.get('/8ja1ViVHIL.txt', controller.test.weChat);
  router.get('/service/pay_config', controller.customer.servicePayConfig);
  router.get('/service/processors', controller.service.index.processors);
  router.get('/service/payment_status', controller.service.index.paymentStatus);
  router.post('/service', controller.service.new.index);
  router.post('/service/file', controller.service.new.file);
  router.get('/service/file/:type/:id', controller.service.new.file);
  router.put('/service/file/:id', controller.service.new.file);
  router.del('/service/file/:id', controller.service.new.file);
  router.get('/service/:id', controller.service.index.index);
  router.put('/service/:id/:target', controller.service.index.update);
  router.post('/customer/login', controller.customer.login);
  router.get('/customer/consulting_price', controller.customer.consultingPrice);
  router.get('/customer/default_contact', controller.customer.defaultContact);
  router.get('/customer/info', controller.customer.info);
  router.put('/customer/info', controller.customer.info);
  router.get('/customer/vip', controller.customer.vip);
  router.put('/customer/vip', controller.customer.vip);
  router.post('/customer/payment', controller.customer.payment);
  router.get('/customer/orders', controller.customer.orders);
  router.get('/order/:id', controller.customer.order);
  router.get('/download_page', controller.file.download_page);
  //
  router.get('/customer/points_total', controller.customer.pointsTotal);
  router.get('/customer/points_records', controller.customer.pointsRecords);
  router.post('/resource/upload', controller.test.resourceUpload);
  router.options('/resource/upload', controller.test.resourceUpload);
  router.get('/test/download', controller.test.download);
  router.get('/lawyers', controller.servicer.lawyers);
  /*
  router.post("/service/file",controller.service.new.file)
*/
  router.get('/serviceList', controller.serviceList.index);
  // router.get("/test",controller.test.test)
  router.get('/test', controller.test.test);
  router.options('/*', controller.home.index);
  router.post('/servicer/login', controller.servicer.login);
  router.put('/backstage/resource', controller.backstage.resource.updateItem);
  router.get('/backstage/resource', controller.backstage.resource.index);
  router.post('/backstage/resource', controller.backstage.resource.newItem);
  router.delete('/backstage/resource', controller.backstage.resource.deleteItem);
  router.get('/backstage/resource/:target', controller.backstage.resource.other);
  // router.post('/backstage/resource', controller.backstage.resource.update);
  /*
  router.post("/servicer/login", controller.servicer.login);
  router.get("/customer", controller.customer.info);
  router.post("/customer/question",controller.customer.question)
  router.put("/customer", controller.customer.info);
  router.put("/customer/vip", controller.customer.vip);
  router.put("/account", controller.account.basic);
  router.get("/chat/jsSdkConfig", controller.chat.jsSdkConfig);
  router.get("/chat/doc", controller.chat.doc);
  router.get("/service/:sessionId",controller.service.index)
  io.of("/service/customer").route("pull", io.controller.serviceCustomer.pull);
  io.of("/service/customer").route("disconnect",io.controller.serviceCustomer.disconnect)
  io.of("/service/servicer").route("pull", io.controller.serviceServicer.pull);
  io.of("/service/servicer").route("disconnect",io.controller.serviceServicer.disconnect)
  io.of("/chat").route("pull", io.controller.chat.pull);
  io.of("/chat").route("push", io.controller.chat.push);
  io.of("/chat").route("disconnect", io.controller.chat.disconnect);
  io.of("/chat").route("instruction", io.controller.chatServicer.instruction);
  router.post("/pay/callback",controller.pay.callback)
  router.post("/pay",controller.pay.request)
  */

  //console.log(controller);
  /*
  router.post("/login",controller.account.login)
  router.post("/register",controller.account.register)
  router.put("/account",controller.account.update)


  
  router.post("/mpUserAccount/login", controller.mpUserAccount.login);
  router.post("/mpUserAccount/update", controller.mpUserAccount.update);
  router.get("/mpUserAccount/getInfo", controller.mpUserAccount.getInfo);
  router.post("/mpUserAccount/updateInfo", controller.mpUserAccount.updateInfo);
  router.post("/test", controller.test.test);
  router.get("/test", controller.test.test);
  router.options("/test",controller.test.test)

  router.post(
    "/mpServicerAccount/register",
    controller.mpServicerAccount.register
  );
  router.post("/mpServicerAccount/login", controller.mpServicerAccount.login);
  router.post("/mpServicerAccount/update", controller.mpServicerAccount.update);

  router.post("/question", controller.question.submit);
  router.get("/", controller.home.index);

  router.get("/chat/document",controller.chat.getDocument)
  router.post("/chat/document",controller.chat.getDocument)
  router.get("/chat/jsSdkConfig",controller.chat.getJsSdkConfig)
  //router.post(
  //  "/loginss",controller.authcallback.index
  //);
  // default
  //console.log("e[41;37m");
  //console.error(io.controller);
  //console.log("e[0m");
  //io.of("/").route("server", io.controller.default.ping);
  io.of("/mpChat").route("push", io.controller.mpChat.push);
  // io.of("/").route("see",io.controller.default.see)
  io.of("/mpChat").route("pull", io.controller.mpChat.pull);
  io.of("/mpChat").route("instruction", io.controller.mpChatInstruction.instruction);
  io.of("/mpChat").route("disconnect", io.controller.mpChat.disconnect);
  io.of("/mpServicerService").route(
    "pull",
    io.controller.mpServicerService.pull
  );
  io.of("/mpServicerService").route(
    "disconnect",
    io.controller.mpServicerService.disconnect
  );
  io.of("/mpUserService").route("pull", io.controller.mpUserService.pull);
  io.of("/mpUserService").route(
    "disconnect",
    io.controller.mpUserService.disconnect
  );
  // io.of("/").route("disconnect",io.controller.default.ping)
  // socket.io
  */
};
