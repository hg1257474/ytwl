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
    //  GET
    async index() {
      const {
        ctx,
        ctx: {
          model: { Service }
        }
      } = this;
      const start = ctx.query.start || 0;
      const user = ctx.session.entity;
      let $match = {
        _id: { $in: user.services.map(item => new this.app.mongoose.Types.ObjectId(item)) }
      };
      if (user.privilege && user.privilege.canAssignService) $match = {};
      const statusMatchArgs = ctx.query.status === 'all' ? {} : { status: ctx.query.status };
      const serviceTypeMatchArgs =
        ctx.query.serviceType === 'all' ? {} : { $in: [ctx.query.serviceType, '$nameF'] };
      console.log(statusMatchArgs, $match);
      ctx.body = await Service.aggregate([
        { $match },
        { $match: statusMatchArgs },
        { $match: serviceTypeMatchArgs },
        {
          $project: {
            status: 1,
            name: 1,
            updatedAt: 1,
            statusWeight: {
              $indexOfArray: [
                ['end', 'processing', 'wait_pay', 'wait_quote', 'wait_assign'],
                '$status'
              ]
            }
          }
        },
        {
          $sort: { statusWeight: -1, updatedAt: -1 }
        },
        { $skip: parseInt(start, 10) },
        { $limit: 20 }
      ]);
      /*
            services.push([
              name.slice(1),
              `${service.createdAt.getFullYear()}.${service.createdAt.getMonth() +
                1}.${service.createdAt.getDate()}`,
              maps[service.status],
              service._id.toString()
            ]);
            */
    }
  }
  return Controller;
};
