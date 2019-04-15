function getServicers() {
  return new Promise(async resolve => {
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
    if (query.sortOrder) args.push({ $sort: { servicesTotal: parseInt(query.sortOrder, 10) } });
    else args.push({ $sort: { id: -1 } });
    args.push({ $skip: (query.current - 1) * 10 });
    args.push({ $limit: 10 });
    const servicers = await ctx.model.Servicer.aggregate(args);
    ctx.body = { servicers, total };
    resolve();
  });
}

module.exports = app => {
  class Controller extends app.Controller {
    // GET start end
    async index() {
      console.log(this.ctx.queries);
      console.log(this.ctx.query);
      await getServicers.call(this);
    }

    // GET | DELETE | PUT | POST    id
    async myUpdate() {
      const {
        ctx,
        ctx: {
          model: { Servicer }
        }
      } = this;
      switch (ctx.method) {
        case 'POST': {
          const { body } = ctx.request;
          if (body.avatar)
            body.avatar[1] = await ctx.service.file.create(body.avatar[1], 'lawyer_avatar');
          const servicer = new Servicer(body);
          await servicer.save();
          await getServicers.call(this);
          break;
        }
        case 'GET':
          ctx.body = await Servicer.findById(ctx.params.id).exec();
          break;
        case 'PUT': {
          const { body } = ctx.request;
          console.log(body);
          if (body.avatar && body.avatar[1].includes('base64'))
            body.avatar[1] = await ctx.service.file.create(body.avatar[1], 'lawyer_avatar');
          await Servicer.findByIdAndUpdate(body.id, body).exec();
          await getServicers.call(this);
          break;
        }
        case 'DELETE':
          await Servicer.findByIdAndDelete(ctx.request.body.id).exec();
          await getServicers.call(this);
          break;
        default:
          throw new Error('servicer switch error');
      }
    }
  }
  return Controller;
};
