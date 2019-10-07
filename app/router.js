'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.post('/backstage/login', controller.backstage.index.login);
  router.get('/backstage/servicer', controller.backstage.servicer.getServicers);
  router.get('/backstage/servicer/:id', controller.backstage.servicer.getServicer);
  router.get(
    '/backstage/servicer/:id/work_statistics',
    controller.backstage.servicer.workStatistics
  );
  router.post('/backstage/servicer', controller.backstage.servicer.addServicer);
  router.put('/backstage/servicer/:id', controller.backstage.servicer.updateServicer);
  router.del('/backstage/servicer/:id', controller.backstage.servicer.deleteServicer);

  router.get('/backstage/analysis', controller.backstage.analysis.index);
  router.post('/service/file', controller.service.file.index);
  router.get('/service/file', controller.service.file.index);
  router.put('/service/file', controller.service.file.index);
  router.get(
    '/client_mini_program/lawyer_exhibition',
    controller.clientMiniProgram.lawyerExhibition
  );
  router.get(
    '/client_mini_program/index_page_banner',
    controller.clientMiniProgram.indexPageBanner
  );
  router.put(
    '/client_mini_program/index_page_banner',
    controller.clientMiniProgram.indexPageBanner
  );
  router.post('/file', controller.file.upload);
  router.get('/resource/:target/:id/:name', controller.other.resource);
  router.get('/backstage/conclusion', controller.backstage.conclusion.index);
  router.get('/backstage/conclusion/archive/:filename', controller.backstage.conclusion.archive);
  router.get('/backstage/conclusion/:id', controller.backstage.conclusion.detail);
  router.get('/servicer/official_account', controller.servicer.officialAccount);
  router.post('/servicer/official_account', controller.servicer.officialAccount);
  router.get('/backstage/customer', controller.backstage.customer.index);
  router.get('/backstage/customer/:id', controller.backstage.customer.info);
  router.get('/backstage/order', controller.backstage.order.index);
  router.get('/backstage/service', controller.backstage.service.index);
  router.get('/backstage/service/name_group', controller.backstage.service.nameGroup);
  router.get('/backstage/service/:id', controller.backstage.service.detail);
  router.get('/resource_test/:id', controller.test.getFile);
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
  router.get('/customer/payment', controller.customer.payment);
  router.put('/customer/payment', controller.customer.payment);
  router.get('/customer/orders', controller.customer.orders);
  router.get('/order/:id', controller.customer.order);
  // router.get('/download_page', controller.file.download_page);
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
};
