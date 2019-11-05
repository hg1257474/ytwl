/*
function getSales(Conclusion,range) {
switch(range){
    case "lastMonth":break;
    case ""
}
  return Conclusion.aggregate([{ $group: { _id: 'all', $sum: '$totalFee' } }]);
}
function getMonthSales(Conclusion){
    return Conclusion.aggregate([$group:{_id:"all"}])
}
*/
module.exports = app => {
  class Controller extends app.Controller {
    // GET start end
    async login() {
      const { ctx } = this;
      console.log(ctx.request.body);
      console.log(ctx.session.entity);
      if (ctx.session.entity) ctx.body = '301';
      else {
        const user = await ctx.model.Servicer.findOne({
          username: ctx.request.body.username,
          password: ctx.request.body.password
        }).exec();
        console.log(user);
        if (user && user.privilege.canManageServicer) {
          console.log('dsds');
          ctx.session = { entity: user };
        }
        ctx.body = user && user.privilege.canManageServicer ? '301' : '401';
      }
    }

    async index() {
      /*
      const { ctx } = this;
      const { query, queries } = ctx;
      const args = [];
      let matchArgs = [];

      args.push({ $match: { conclusion: { $exists: true } } });

      if (query.serviceNameFilter) {
        console.log(queries.serviceNameFilter);
        matchArgs.push({ serviceName: { $all: queries.serviceNameFilter } });
      }
      if (query.processorFilter) {
        matchArgs.push({ processor: query.processorFilter });
      }
      args.push({
        $lookup: {
          from: 'servicers',
          let: { processorId: '$processorId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$processorId'] } } },
            { $project: { name: 1, _id: 0 } }
          ],
          as: 'processor'
        }
      });
      args.push({
        $project: {
          serviceName: '$name',
          processor: {
            $let: {
              vars: {
                processor: { $arrayElemAt: ['$processor', 0] }
              },
              in: '$$processor.name'
            }
          }
        }
      });
      if (matchArgs.length) args.push({ $match: { $and: matchArgs } });
      //   args.push({ $match: { $and: matchArgs } });
      console.log(matchArgs);
      console.log(JSON.stringify(args));
      const total = await ctx.model.Service.aggregate([...args, { $count: 'total' }]);
      console.log(total);
      args.push({ $sort: { _id: -1 } });
      args.push({ $skip: (query.current - 1) * 10 });
      args.push({ $limit: 10 });
      console.log(args);
      const conclusions = await ctx.model.Service.aggregate(args);
      ctx.body = { conclusions, total: total[0] ? total[0].total : 0 };
      */
    }
  }
  return Controller;
};
