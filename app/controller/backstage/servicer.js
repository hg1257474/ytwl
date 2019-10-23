const moment = require('moment');

module.exports = app => {
  class Controller extends app.Controller {
    // GET start end
    async getServicers() {
      const { ctx } = this;
      const { query, queries } = ctx;
      const args = [];
      let matchArgs = [];
      if (query.servicerId) matchArgs.push({ _id: app.mongoose.Types.ObjectId(query.servicerId) });
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
      const { lawyerExhibitionOrder } = body;
      delete body.lawyerExhibitionOrder;
      if (body.avatar)
        body.avatar[1] = await ctx.service.file.create(body.avatar[1], 'lawyer_avatar');
      const servicer = new ctx.model.Servicer(body);
      await servicer.save();
      if (lawyerExhibitionOrder) {
        let lawyerExhibition = await ctx.model.Resource.findOne({
          category: 'lawyerExhibition'
        }).exec();
        lawyerExhibition.content.splice(lawyerExhibitionOrder - 1, 0, servicer._id);
        lawyerExhibition.markModified('content');
        await lawyerExhibition.save();
        lawyerExhibition = {
          content: await ctx.model.Servicer.find(
            { _id: { $in: lawyerExhibition.content } },
            { avatar: 1, expert: 1, name: 1 }
          ).lean(),
          updatedAt: lawyerExhibition.updatedAt
        };
        const _app = app;
        _app.cache.lawyerExhibition = 'refresh';
      }
      ctx.body = 'success';
    }

    async updateServicer() {
      const { ctx } = this;
      const { body } = ctx.request;
      console.log(body);
      if (body.avatar && body.avatar[1].includes('base64'))
        body.avatar[1] = await ctx.service.file.create(body.avatar[1], 'lawyer_avatar');
      const lawyerExhibition = await ctx.model.Resource.findOne({
        category: 'lawyerExhibition'
      }).exec();
      console.log(lawyerExhibition);
      const position = lawyerExhibition.content.findIndex(item => {
        console.log(item);
        return item.toString() === body.id.toString();
      });
      console.log(position);
      if (body.lawyerExhibitionOrder > 0 || position !== body.lawyerExhibitionOrder - 1) {
        if (position !== -1) {
          console.log('fuck');
          lawyerExhibition.content.splice(position, 1);
        }
        if (body.lawyerExhibitionOrder) {
          console.log('log2');
          lawyerExhibition.content.splice(body.lawyerExhibitionOrder - 1, 0, body.id.toString());
        }
        lawyerExhibition.markModified('content');
        await lawyerExhibition.save();
      }
      const _app = app;
      _app.cache.lawyerExhibition = 'refresh';
      delete body.lawyerExhibitionOrder;
      await ctx.model.Servicer.findByIdAndUpdate(ctx.params.id, body).exec();
      ctx.body = 'success';
    }

    async deleteServicer() {
      const { ctx } = this;
      const lawyerExhibition = await ctx.model.Resource.findOne({
        category: 'lawyerExhibition'
      }).exec();
      console.log(lawyerExhibition.content, ctx.params.id);
      const position = lawyerExhibition.content.findIndex(
        item => item.toString() === ctx.params.id.toString()
      );
      if (position > -1) {
        console.log('start');
        lawyerExhibition.content.splice(position, 1);
        lawyerExhibition.markModified('content');
        await lawyerExhibition.save();
        const _app = app;
        _app.cache.lawyerExhibition = 'refresh';
      }
      await ctx.model.Servicer.findByIdAndDelete(ctx.params.id).exec();
      ctx.body = 'success';
    }

    async getServicer() {
      const { ctx } = this;
      ctx.body = await ctx.model.Servicer.findById(ctx.params.id).exec();
    }

    async workStatistics() {
      const { ctx } = this;
      let services = await ctx.model.Servicer.findById(ctx.params.id)
        .select('services')
        .lean();
      const now = moment();
      let startDate;
      switch (ctx.query.period) {
        case 'month':
          startDate = now.subtract(1, 'months');
          break;
        case 'quarter':
          startDate = now.subtract(3, 'months');
          break;
        case 'year':
          startDate = now.subtract(1, 'years');
          break;
        default:
          throw Error('period');
      }
      services = await ctx.model.Service.find({
        status: 'end',
        _id: { $in: services.services },
        $expr: {
          $gte: ['$updatedAt', startDate]
        }
      })
        .select('orderId comment duration')
        .exec();
      console.log(services);
      const orderIds = [];
      let durationTotal = 0;
      let commentCount = 0;
      const averageComment = [0, 0, 0];
      services.forEach(service => {
        durationTotal += service.duration;
        orderIds.push(service.orderId);
        if (service.comment.length) {
          commentCount += 1;
          console.log(service.comment);
          averageComment.forEach(function a(item, index) {
            averageComment[index] = item + service.comment[index];
          });
        }
      });
      console.log(orderIds);
      const salesTotal = await ctx.model.Order.aggregate([
        {
          $match: {
            _id: { $in: orderIds }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalFee' }
          }
        }
      ]);
      ctx.body = {
        serviceTotal: services.length,
        durationTotal,
        averageComment: commentCount
          ? averageComment.map(item => item / commentCount)
          : averageComment,
        salesTotal: salesTotal.length && salesTotal[0].total
      };
    }
  }
  return Controller;
};
