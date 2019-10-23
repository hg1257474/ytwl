module.exports = app => {
  class Controller extends app.Controller {
    // GET start end
    async index() {
      const { ctx } = this;
      const { query, queries } = ctx;
      const args = [];
      let matchArgs = [];
      if (query.customerId) {
        matchArgs.push({ customerId: ctx.app.mongoose.Types.ObjectId(query.customerId) });
      }
      if (query.processorId) {
        matchArgs.push({ processorId: ctx.app.mongoose.Types.ObjectId(query.processorId) });
      }
      if (query.isStatusFiltered) {
        matchArgs.push({ status: { $in: queries.isStatusFiltered } });
      }
      if (query.isNameFiltered) {
        matchArgs.push({ name: { $all: ctx.helper.formatQueryArg(query.isNameFiltered) } });
      }
      if (query.isUpdatedAtFiltered) {
        matchArgs.push({
          updatedAt: {
            $gte: new Date(queries.isUpdatedAtFiltered[0]),
            $lte: new Date(queries.isUpdatedAtFiltered[1])
          }
        });
      }
      if (matchArgs.length > 0) {
        matchArgs = { $and: matchArgs };
        args.push({ $match: matchArgs });
      } else matchArgs = {};
      console.log(JSON.stringify(matchArgs));
      const total = await ctx.model.Service.find(matchArgs).countDocuments();
      args.push({
        $project: {
          status: 1,
          name: 1,
          updatedAt: 1
        }
      });
      const $sort = {};
      if (query.updatedAtSort) $sort.updatedAt = parseInt(query.updatedAtSort, 10);
      else $sort._id = -1;
      args.push({ $sort });
      args.push({ $skip: (query.current - 1) * 10 });
      args.push({ $limit: 10 });
      console.log(args);
      const services = await ctx.model.Service.aggregate(args);
      ctx.body = { services, total };
    }

    async detail() {
      const { ctx } = this;
      const service = await ctx.model.Service.findById(ctx.params.id).lean();
      console.log(service);
      service.customerName = (await ctx.model.Customer.findById(service.customerId)
        .select('info')
        .exec()).info.company;
      if (service.orderId)
        service.totalFee = (await ctx.model.Order.findById(service.orderId)
          .select('totalFee')
          .exec()).totalFee;
      if (service.processorId)
        service.processorName = (await ctx.model.Servicer.findById(service.processorId)
          .select('name')
          .exec()).name;
      console.log(service);
      ctx.body = service;
    }

    async nameGroup() {
      this.ctx.body = app.cache.indexPageColumn.content.map(item => item[0]);
    }
  }
  return Controller;
};
