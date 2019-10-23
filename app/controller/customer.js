module.exports = app => {
  class Controller extends app.Controller {
    // PUT
    async info() {
      const { ctx } = this;
      const customer = ctx.session.entity;
      // console.log(ctx.session);
      if (ctx.method === 'GET') {
        ctx.body = customer.info;
        return;
      }
      customer.info = { ...customer.info, ...ctx.request.body };
      await customer.save();

      let isAllInfo = false;
      for (const key of Object.keys(customer.info)) {
        if (customer.info[key] && ['phone', 'weChat', 'dingTalk'].includes(key)) {
          isAllInfo = true;
          break;
        }
        if (!customer.info[key] && !['phone', 'weChat', 'dingTalk'].includes(key)) {
          isAllInfo = false;
          break;
        }
      }
      ctx.body = isAllInfo.toString();
    }

    async reminderTotal() {
      this.ctx.body =
        this.ctx.session.entity.noViewedEnd.length + this.ctx.session.entity.waitPayTotal;
    }

    // GET
    async servicePayConfig() {
      const {
        ctx,
        ctx: {
          model: { Service, Order, Customer }
        }
      } = this;
      const service = await Service.findById(ctx.query.id).exec();
      // console.log(service);
      const order = await Order.findById(service.orderId).lean();
      const user = await Customer.findById(order.customerId).exec();
      if (ctx.query.pointDeduction && ctx.query.pointDeduction > user.points.total)
        throw new Error('503');
      if (ctx.query.pointDeduction) order.description.pointDeduction = ctx.query.pointDeduction;
      delete order._id;
      const newOrder = await Order.create(order);
      service.orderId = newOrder._id;
      await service.save();
      if (ctx.query.pointDeduction && !(order.totalFee * 100 - ctx.query.pointDeduction * 100))
        ctx.redirect(`/customer/payment?orderId=${newOrder._id}`);
      else ctx.body = await this.ctx.service.weChat.getPayConfig(newOrder);
    }

    async login() {
      const { ctx } = this;
      const { Customer } = ctx.model;
      let customer = null;
      if (!ctx.session.entity) {
        const openId = await ctx.service.weChat.getOpenId('Customer');
        customer = await Customer.findOne({ openId }).exec();
        if (!customer) {
          customer = new Customer({
            openId
          });
          await customer.save();
        }
        ctx.session = { entity: customer };
      } else customer = ctx.session.entity;
      let isAllInfo = false;
      Object.keys(customer.info).some(key => {
        if (customer.info[key] && ['phone', 'weChat', 'dingTalk'].includes(key)) {
          isAllInfo = true;

          return true;
        }
        if (!customer.info[key] && !['phone', 'weChat', 'dingTalk'].includes(key)) {
          isAllInfo = false;
          return true;
        }
        return false;
      });
      ctx.body = {
        vip: customer.vip,
        isAllInfo,
        noViewedEnd: customer.noViewedEnd,
        waitPayTotal: customer.waitPayTotal
      };
      const resource = app.cache.indexPageColumn;
      if (resource.updatedAt.toString() !== ctx.request.body.expires) {
        ctx.body.indexPage = resource.content;
        ctx.body.expires = resource.updatedAt.toString();
      }
    }

    async vip() {
      const {
        ctx,
        ctx: {
          request: { body },
          model: { Order },
          session: { entity }
        }
      } = this;
      if (ctx.method === 'GET') {
        ctx.session.entity = await this.ctx.model.Customer.findById(entity._id).exec();

        ctx.body = ctx.session.entity.vip;
        ctx.status = 200;
        return;
      }
      console.log(body);
      if (body.description.pointDeduction && body.description.pointDeduction > entity.points.total)
        throw new Error('503');
      const orderId = await this.ctx.service.pay.new(
        body.totalFee,
        entity._id,
        body.name,
        body.description
      );
      // console.log(orderId);
      const order = await Order.findById(orderId).exec();
      console.log(order);
      // order.description.orderId = order._id.toString();
      // await order.save();
      if (
        order.description.pointDeduction &&
        !(order.description.pointDeduction * 100 - order.totalFee * 100)
      )
        ctx.redirect(`/customer/payment?orderId=${order._id}`);
      else ctx.body = await this.ctx.service.weChat.getPayConfig(order);
    }

    async pushTest() {
      await this.ctx.service.weChat.pushMessage(
        'oA6C84heEWDC0kbuZx1GiS3q3Kps',
        '/pages/index/index',
        'Customer',
        'newService',
        {
          first: { value: 'test', color: '#888' },
          keyword1: { value: 'test', color: '#888' },
          keyword2: { value: 'test', color: '#888' },
          remark: { value: 'test', color: '#888' }
        }
      );
      this.ctx.body = 'success';
    }

    async order() {
      const { ctx } = this;
      const order = await ctx.model.Order.findById(ctx.params.id).exec();
      const result = {
        name: order.name,
        totalFee: order.totalFee,
        remark: '测试使用',
        date: `${order.createdAt.getFullYear()}年${order.createdAt.getMonth() +
          1}月${order.createdAt.getDate()}日 ${order.createdAt.getHours()}时${order.createdAt.getMinutes()}分${order.createdAt.getSeconds()}秒`
      };
      ctx.body = result;
    }

    async pointsTotal() {
      this.ctx.body = this.ctx.session.entity.points.total;
    }

    async consultingPrice() {
      const { ctx } = this;
      const resource = this.app.cache.product;
      ctx.body = {};
      if (ctx.request.header['if-modified-since'] !== resource.updatedAt.toString()) {
        ctx.body.payPage = resource.content;
        ctx.set('expires', resource.updatedAt.toString());
      }
      ctx.body.points = ctx.session.entity.points.total;
    }

    async orders() {
      const {
        ctx,
        ctx: {
          model: { Order },
          session: { entity }
        }
      } = this;
      const orders = [];
      for (const orderId of entity.orders) {
        const order = await Order.findById(orderId).exec();
        const { description } = order;
        let flag = false;
        if (ctx.query.typeFiltered === 'all') flag = true;
        else {
          switch (ctx.query.typeFiltered) {
            case 'contract':
              flag = !!description.serviceId;
              break;
            case 'communication':
              flag = !!description.balance;
              break;
            case 'monthVip':
              flag = !!description.monthVip;
              break;
            case 'yearVip':
              flag = !!description.yearVip;
              break;
            default:
              throw new Error('order description error');
          }
        }
        if (flag)
          orders.push([
            order.name,
            `${order.createdAt.getFullYear()}年${order.createdAt.getMonth() +
              1}月${order.createdAt.getDate()}日`,
            order.totalFee,
            order._id.toString()
          ]);
      }
      ctx.body = orders;
    }

    async payment() {
      console.log(12321312);
      const { ctx } = this;
      ctx.body = ctx.query.orderId ? 'totalFee is 0' : 'success';
      const xml = await this.ctx.parseXml();
      console.log(xml);
      const result = xml.includes('<result_code><![CDATA[SUCCESS]]></result_code>');
      if (result || ctx.query.orderId) {
        const orderId =
          ctx.query.orderId ||
          xml.split('<out_trade_no><![CDATA[')[1].split(']]></out_trade_no>')[0];
        console.log(orderId);
        const order = await this.ctx.model.Order.findById(orderId).exec();
        console.log(order);
        const customer = await this.ctx.model.Customer.findById(order.customerId).exec();
        let vip;
        let points;
        order.hasPaid = true;
        if (order.description.serviceId) {
          const service = await this.ctx.model.Service.findById(order.description.serviceId).exec();
          service.status = 'wait_assign';
          points = '服务支付';
          customer.waitPayTotal -= 1;
          ctx
            .getLogger('indexPageHintChangeLogger')
            .info(`waitPayTotal————${customer._id.toString()}————subtract`, order.toJSON(), xml);
          await service.save();
        } else if (order.description.balance) {
          vip = { balance: 1 };
          points = '单次咨询充值';
          await customer.save();
        } else if (order.description.monthVip) {
          vip = {
            kind: 'month',
            expires: new Date(30 * 24 * 3600 * 1000 + new Date().getTime())
          };
          points = '月度会员充值';
        } else {
          vip = {
            kind: 'year',
            expires: new Date(365 * 24 * 3600 * 1000 + new Date().getTime())
          };
          points = '年度会员充值';
        }
        customer.orders.push(orderId);
        if (vip) customer.vip = { ...customer.vip, ...vip };
        const pointDeduction = order.description.pointDeduction || 0;
        customer.consumption =
          (customer.consumption * 100 + order.totalFee * 100 - pointDeduction * 100) / 100;
        if (pointDeduction)
          customer.points.records.push([`${points}积分抵扣`, order.createdAt, -pointDeduction]);
        if ((order.totalFee * 100 - pointDeduction * 100) / 100 > 0)
          customer.points.records.push([
            points,
            order.createdAt,
            (order.totalFee * 100 - pointDeduction * 100) / 100
          ]);
        customer.points.total =
          (customer.points.total * 100 + order.totalFee * 100 - 2 * pointDeduction * 100) / 100;
        await customer.save();
        await order.save();
      }
    }

    async pointsRecords() {
      this.ctx.body = this.ctx.session.entity.points.records.map(item => {
        console.log(item[1]);

        return [
          item[0],
          `${item[1].getFullYear()}.${item[1].getMonth() + 1}.${item[1].getDate()}`,
          item[2]
        ];
      });
    }

    async defaultContact() {
      let defaultContact = this.ctx.session.entity.info;
      defaultContact = {
        name: defaultContact.contact,
        phone: defaultContact.phone,
        weChat: defaultContact.weChat,
        dingTalk: defaultContact.dingTalk
      };
      this.ctx.body = { defaultContact };
    }
  }
  return Controller;
};
