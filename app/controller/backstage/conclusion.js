module.exports = app => {
  class Controller extends app.Controller {
    // GET start end
    async index() {
      const { ctx } = this;
      const { query, queries } = ctx;
      const args = [];
      let matchArgs = [];
      args.push({ $match: { conclusion: { $exists: true } } });

      if (query.isServiceNameFiltered) {
        matchArgs.push({ serviceName: { $all: queries.isServiceNameFiltered } });
      }
      if (query.isProcessorFiltered) {
        matchArgs.push({ processor: query.isProcessorFiltered });
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
    }

    async detail() {
      const { ctx } = this;
      const service = await ctx.model.Service.findById(ctx.params.id).lean();
      service.processorName = (await ctx.model.Servicer.findById(service.processorId)
        .select('name')
        .exec()).name;
      ctx.body = service;
    }
  }

  return Controller;
};
/*
db.services.aggregate([
    { $match: { conclusion: { $exists: true } } }
    , {
        $lookup: {
            from: 'servicers',
            let: { processorId: '$processorId' },
            pipeline: [
                { $match: { $expr: { $eq: ["$_id", '$$processorId'] } } },
                { $project: { name: 1, _id: 0 } }
            ],
            as: 'processor'
        }
    },

    {
        $project: {
            serviceName:"$name", 
            
            qwer: {
                $let: {
                    vars: {
                        asdd: { $arrayElemAt: ["$processor", 0] }
                    },
                    in: "$$asdd.name"
                }
            }
        }
    },{$count:"qqqqqqqqqq"}])
    */
