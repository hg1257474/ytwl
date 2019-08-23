module.exports = app => {
  class Controller extends app.Controller {
    // GET start end
    async index() {
      const { ctx } = this;
      const { query, queries } = ctx;
      const args = [];
      let matchArgs = [];
      if (query.isStatusFiltered) {
        matchArgs.push({ status: { $in: queries.isStatusFiltered } });
      }
      if (query.isNameFiltered) {
        matchArgs.push({ name: { $all: queries.isNameFiltered } });
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
      console.log(matchArgs);
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
  }
  return Controller;
};