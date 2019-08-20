module.exports = app => {
  class Controller extends app.Controller {
    // GET start end
    async getServicers() {
      const { ctx } = this;
      const { query, queries } = ctx;
      const args = [];
      let matchArgs = [];
      if (query.isNameFiltered) matchArgs.push({ name: query.isNameFiltered });
      if (query.isUsernameFiltered) matchArgs.push({ username: query.isUsernameFiltered });
      if (query.privilegeFilter)
        matchArgs.push({
          $or: queries.privilegeFilter.map(item => ({ [`privilege.${item}`]: true }))
        });
      if (matchArgs.length) {
        matchArgs = { $and: matchArgs };
        args.push({ $match: matchArgs });
      } else matchArgs = {};
      const total = await ctx.model.Servicer.find(matchArgs).count();
      args.push({
        $project: {
          name: 1,
          id: '$_id',
          username: 1,
          privilege: 1,
          _id: 0,
          servicesTotal: { $size: '$services' }
        }
      });
      if (query.servicesTotalSortOrder)
        args.push({ $sort: { servicesTotal: parseInt(query.servicesTotalSortOrder, 10) } });
      else args.push({ $sort: { id: -1 } });
      args.push({ $skip: (query.current - 1) * 10 });
      args.push({ $limit: 10 });
      const servicers = await ctx.model.Servicer.aggregate(args);
      ctx.body = { servicers, total };
    }

    async addServicer() {
      const { ctx } = this;
      const { body } = ctx.request;
      if (body.avatar)
        body.avatar[1] = await ctx.service.file.create(body.avatar[1], 'lawyer_avatar');
      const servicer = new ctx.model.Servicer(body);
      await servicer.save();
      ctx.body = 'success';
    }

    async updateServicer() {
      const { ctx } = this;
      const { body } = ctx.request;
      if (body.avatar && body.avatar[1].includes('base64'))
        body.avatar[1] = await ctx.service.file.create(body.avatar[1], 'lawyer_avatar');
      console.log(body);
      await ctx.model.Servicer.findByIdAndUpdate(ctx.params.id, body).exec();
      ctx.body = 'success';
    }

    async deleteServicer() {
      const { ctx } = this;
      await ctx.model.Servicer.findByIdAndDelete(ctx.params.id).exec();
      ctx.body = 'success';
    }

    async getServicer() {
      const { ctx } = this;
      ctx.body = await ctx.model.Servicer.findById(ctx.params.id).exec();
    }
  }
  return Controller;
};
