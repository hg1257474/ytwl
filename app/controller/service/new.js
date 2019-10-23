const fs = require('fs');
module.exports = app => {
  class Controller extends app.Controller {
    // PUT openId avatar nickname
    async file() {
      const { ctx } = this;
      switch (ctx.method) {
        case 'POST':
          this.service.upload.preNew();
          break;
        case 'GET':
          await this.service.upload.getUploadPage();
          break;
        case 'DELETE':
          this.service.upload.deleteUploaded();
          ctx.body = 'success';
          break;
        case 'PUT':
          this.service.upload.index();
          break;
        default:
          throw new Error('dsd');
      }
    }

    async index() {
      const {
        ctx,
        ctx: {
          model: { Service, NewService, Resource },
          request: { body }
        }
      } = this;
      console.log(body);
      const { description } = body;
      // console.log(body.name);
      const customer = ctx.session.entity;
      if (typeof body.description !== 'string')
        description.forEach(item => {
          const uniqueId = ctx.helper.getUniqueId();
          fs.copyFileSync(item[2], `/resource/description/${uniqueId}`);
          item[2] = uniqueId;
        });
      if (
        body.name.includes('communication') &&
        customer.vip.balance &&
        customer.vip.balance === 1
      ) {
        // console.log('yess');
        customer.vip = {};
        ctx.body = 'null';
      }
      const service = new Service({
        customerId: customer._id,
        name: body.name,
        status: body.name[2] === 'contract' ? 'wait_quote' : 'wait_assign',
        description,
        contact: body.contact
      });
      await service.save();
      customer.services.push(service._id);
      await customer.save();
      //console.log(customer);
      ctx.status = 201;
    }
  }
  return Controller;
};
