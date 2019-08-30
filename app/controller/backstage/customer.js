module.exports = app => {
  class Controller extends app.Controller {
    // GET start end
    async index() {
      const { ctx } = this;
      const { query, queries } = ctx;
      const args = [];
      let matchArgs = [];
      if (query.companyFilter) {
        const regexStr = query.companyFilter.replace(/\s+/g, '|');
        matchArgs.push({ 'info.company': { $regex: new RegExp(regexStr) } });
      }
      if (matchArgs.length > 0) {
        matchArgs = { $and: matchArgs };
        args.push({ $match: matchArgs });
      } else matchArgs = {};
      console.log(matchArgs);
      const total = await ctx.model.Customer.find(matchArgs).countDocuments();
      args.push({
        $project: {
          company: '$info.company',
          pointsTotal: '$points.total',
          consumption: 1,
          serviceTotal: { $size: '$services' },
          orderTotal: { $size: '$orders' }
        }
      });
      const $sort = {};
      if (query.pointsTotalSort) $sort.pointsTotal = parseInt(query.pointsTotalSort, 10);
      else if (query.consumptionSort) $sort.consumption = parseInt(query.consumptionSort, 10);
      else if (query.serviceTotalSort) $sort.serviceTotal = parseInt(query.serviceTotalSort, 10);
      else if (query.orderTotalSort) $sort.orderTotal = parseInt(query.orderTotalSort, 10);
      else $sort._id = -1;
      args.push({ $sort });
      args.push({ $skip: (query.current - 1) * 10 });
      args.push({ $limit: 10 });
      console.log(args);
      const customers = await ctx.model.Customer.aggregate(args);
      ctx.body = { customers, total };
    }

    async info() {
      const { ctx } = this;
      ctx.body = (await ctx.model.Customer.findById(ctx.params.id)
        .select('info')
        .lean()).info;
    }
  }
  return Controller;
};
