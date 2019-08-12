const fs = require('fs');

const maps = {
  contract: '合同',
  review: '审核',
  draft: '起草',
  communication: '咨询',
  submitted: '已提交',
  wait_quote: '待报价',
  wait_assign: '待分配',
  wait_pay: '待支付',
  processing: '服务中',
  end: '已完结'
};
module.exports = app => {
  class Controller extends app.Controller {
    async index() {
      const {
        app: {
          methods: { objectIdEqual: oIdEqual }
        },
        ctx,
        ctx: {
          session: { entity },
          model: { Service, Order, Servicer }
        }
      } = this;

      const body = {};
      const service = await Service.findById(ctx.params.id).exec();
      //console.log(service)
      //service.description="dddddddddd"
      // console.log(service.description);
      // get description
      body.description = service.description;
      // processor view
      if (service.processorId) {
        // customer view
        if (!entity.privilege)
          body.processor = await Servicer.findById(service.processorId, {
            name: 1,
            avatar: 1,
            serviceTotal: 1,
            grade: 1,
            expert: 1,
            _id: 0
          }).lean();
        // manager view
        else if (!oIdEqual(entity._id, service.processorId)) {
          const temp = await Servicer.findById(service.processorId, {
            name: 1
          }).lean();
          body.processor = [temp.name, temp._id];
        }
      }
      // contact view
      body.contact = service.contact;
      // status view
      body.status = maps[service.status];
      // name view
      let name = '';
      service.name.forEach(item => (name += `-${maps[item] || item}`));
      body.name = name.slice(1);
      // payment view
      if (!oIdEqual(entity._id, service.processorId)) {
        body.payment = await Order.findById(service.orderId, {
          totalFee: 1,
          hasPaid: 1,
          _id: 0
        }).lean();
      }
      // can send quote
      if (['wait_quote', 'wait_pay'].includes(service.status) && entity.privilege)
        body.canSendQuote = true;

      // conclusion view
      // if (entity.privilege && service.conclusion)
      if (service.conclusion) body.conclusion = service.conclusion;
      // can endService
      if (oIdEqual(entity._id, service.processorId) && service.status === 'processing')
        body.canEndService = true;
      // can make conclusion
      if (
        service.status === 'end' &&
        oIdEqual(entity._id, service.processorId) &&
        !service.conclusion
      )
        body.canMakeConclusion = true;
      // can assign service
      if (entity.privilege && service.status === 'wait_assign') {
        body.processors = (await Servicer.find(
          { 'privilege.canProcessingService': true },
          { name: 1 }
        ).lean()).map(item => [item.name, item._id]);
        // const processors = [];
        // servicers.forEach(item => {
        // if (item.privilege.canProcessingService) processors.push([item.name, item._id]);
        // });
      }
      // comment view
      if (!oIdEqual(entity._id, service.processorId)) body.comment = service.comment;
      // can make comment
      // console.log(service);
      if (
        service.status === 'end' &&
        oIdEqual(entity._id, service.customerId) &&
        !service.comment.length
      )
        body.canMakeComment = true;

      ctx.body = body;
    }

    async update() {
      const {
        ctx,
        app: {
          methods: { objectIdEqual: oIdEqual }
        },
        ctx: {
          session: { entity },
          service: { pay },
          model: { Service, Servicer },
          request: { body }
        }
      } = this;
      const service = await Service.findById(ctx.params.id).exec();
      switch (ctx.params.target) {
        case 'status':
          service.status = 'end';
          break;
        case 'comment':
          service.comment = body;
          break;
        case 'payment': {
          if (service.status !== 'end') {
            if (service.status === 'wait_quote') service.status = 'wait_pay';
            let name = '';
            service.name.forEach(item => (name += `-${maps[item] || item}`));
            const orderId = await pay.new(body.fee, service.customerId, name.slice(1), {
              serviceId: service._id
            });
            // console.log(orderId);
            service.orderId = orderId;
          }
          break;
        }
        case 'conclusion': {
          if (body.conclusion[1].length)
            body.conclusion[1].forEach(item => {
              const uniqueId = this.app.methods.getUniqueId();
              fs.copyFileSync(item[2], `/resource/conclusion/${uniqueId}`);
              item[2] = uniqueId;
            });
          service.conclusion = body.conclusion;
          break;
        }

        case 'processor': {
          console.log(this);
          console.log(this.ctx);
          //console.log(ctx)
          if (service.processorId) {
            const servicer = await Servicer.findById(service.processorId).exec();
            servicer.services = servicer.services.filter(item => !oIdEqual(item, service._id));
            await servicer.save();
          }
          console.log(this.ctx.request.body);
          const _body = this.ctx.request.body;
          service.processorId = _body.processorId;
          service.status = 'processing';
          const servicer = await Servicer.findById(service.processorId).exec();
          servicer.services.push(service);
          await servicer.save();
          await service.save();
          break;
        }
        default:
          throw new Error('dsds');
      }
      this.ctx.body = 'success';
      await service.save();
    }

    async processors() {
      this.ctx.body = (await this.ctx.model.Servicer.find(
        { 'privilege.canProcessingService': true },
        { name: 1 }
      ).lean()).map(item => [item.name, item._id]);
    }

    async paymentStatus() {
      const { ctx } = this;
      const service = await ctx.model.Service.findById(ctx.query.id)
        .select('status orderId')
        .lean();
      const payment = await ctx.model.Order.findById(service.orderId)
        .select('totalFee hasPaid -_id')
        .lean();
      ctx.body = {
        status: maps[service.status],
        payment
      };
    }
  }
  return Controller;
};
