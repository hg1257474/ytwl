const moment = require('moment');

const now = moment();
const lastYearNow = moment().year(now.year() - 1);
const year = now.year();
const month = now.month();
const week = now.week();
const lastYearWeeks = lastYearNow.weeksInYear();
const monthTU = { month: { $month: { date: '$updatedAt' } } };
const weekTU = {
  ...monthTU,
  week: { $week: { date: '$updatedAt' } }
};
const dayTU = { ...weekTU, day: { $dayOfWeek: { date: '$updatedAt' } } };
const monthTC = { month: { $month: { date: '$createdAt' } } };
const weekTC = {
  ...monthTC,
  week: { $week: { date: '$createdAt' } }
};
const dayTC = { ...weekTC, day: { $dayOfWeek: { date: '$createdAt' } } };

const monthSalesMatchArgs = {
  $match: {
    $expr: {
      $and: [
        { $eq: ['$hasPaid', true] },
        { $eq: [new Date().getFullYear(), { $year: { date: '$updatedAt' } }] }
      ]
    }
  }
};
const weekSalesMatchArgs = {
  $match: {
    $expr: {
      $and: [
        { $eq: ['$hasPaid', true] },
        { $eq: [new Date().getFullYear(), { $year: { date: '$updatedAt' } }] },
        { $eq: [new Date().getMonth() + 1, { $month: { date: '$updatedAt' } }] }
      ]
    }
  }
};
const daySalesMatchArgs = {
  $match: {
    $expr: {
      $and: [
        { $eq: ['$hasPaid', true] },
        { $eq: [new Date().getFullYear(), { $year: { date: '$updatedAt' } }] },
        { $eq: [new Date().getMonth() + 1, { $month: { date: '$updatedAt' } }] },
        { $eq: [moment().week() - 1, { $week: { date: '$updatedAt' } }] }
      ]
    }
  }
};
const monthNCMatchArgs = {
  $match: {
    $expr: {
      $and: [{ $eq: [year, { $year: { date: '$createdAt' } }] }]
    }
  }
};
const weekNCMatchArgs = {
  $match: {
    $expr: {
      $and: [
        { $eq: [new Date().getFullYear(), { $year: { date: '$createdAt' } }] },
        { $eq: [new Date().getMonth() + 1, { $month: { date: '$createdAt' } }] }
      ]
    }
  }
};
const dayNCMatchArgs = {
  $match: {
    $expr: {
      $and: [
        { $eq: [new Date().getFullYear(), { $year: { date: '$createdAt' } }] },
        { $eq: [new Date().getMonth() + 1, { $month: { date: '$createdAt' } }] },
        { $eq: [moment().week() - 1, { $week: { date: '$createdAt' } }] }
      ]
    }
  }
};
module.exports = app => {
  class Controller extends app.Controller {
    // GET start end
    async index() {
      const { ctx } = this;
      const { query, queries } = ctx;
      const monthSalesTrend = await ctx.model.Order.aggregate([
        monthSalesMatchArgs,
        { $group: { _id: monthTU, sales: { $sum: '$totalFee' } } },
        { $sort: { _id: 1 } }
      ]);
      const weekSalesTrend = await ctx.model.Order.aggregate([
        weekSalesMatchArgs,
        { $group: { _id: weekTU, sales: { $sum: '$totalFee' } } },
        { $sort: { _id: 1 } }
      ]);
      const daySalesTrend = await ctx.model.Order.aggregate([
        daySalesMatchArgs,
        { $group: { _id: dayTU, sales: { $sum: '$totalFee' } } },
        { $sort: { _id: 1 } }
      ]);
      const monthNCTrend = await ctx.model.Customer.aggregate([
        monthNCMatchArgs,
        { $group: { _id: monthTC, total: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      const weekNCTrend = await ctx.model.Customer.aggregate([
        weekNCMatchArgs,
        { $group: { _id: weekTC, total: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      const dayNCTrend = await ctx.model.Customer.aggregate([
        dayNCMatchArgs,
        { $group: { _id: dayTC, total: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      let weekNSMatchArgs = {
        $and: [
          { $eq: [{ $year: { date: '$createdAt' } }, year] },
          { $lte: [{ $week: { date: '$createdAt' } }, week] }
        ]
      };

      if (week < 7) {
        weekNSMatchArgs = {
          $or: [
            weekNSMatchArgs,
            {
              $and: [
                { $eq: [{ $year: { date: '$createdAt' } }, year - 1] },
                { $gte: [{ $month: { date: '$createdAt' } }, lastYearWeeks + week - 7] }
              ]
            }
          ]
        };
      } else weekNSMatchArgs.$and.push({ $gte: [{ $week: { date: '$createdAt' } }, week - 7] });
      const weekNSTrend = await ctx.model.Service.aggregate([
        {
          $match: {
            $expr: weekNSMatchArgs
          }
        },
        {
          $group: {
            _id: { week: { $week: { date: '$createdAt' } }, name: { $slice: ['$name', 0, 2] } },
            total: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.week',
            services: { $push: { name: '$_id.name', total: '$total' } },
            total: { $sum: '$total' }
          }
        }
      ]);
      const monthSalesPie = await ctx.model.Order.aggregate([
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$hasPaid', true] },
                { $eq: [moment().year(), { $year: { date: '$updatedAt' } }] },
                { $eq: [moment().month(), { $month: { date: '$updatedAt' } }] }
              ]
            }
          }
        },
        {
          $addFields: {
            kind: {
              $cond: {
                if: { $in: ['$name', ['单次咨询', '包月会员', '包年会员']] },
                then: '$name',
                else: {
                  $let: {
                    vars: {
                      nameArray: { $split: ['$name', '-'] }
                    },
                    in: {
                      $concat: [
                        '合同',
                        {
                          $arrayElemAt: [
                            '$$nameArray',
                            { $subtract: [{ $size: '$$nameArray' }, 1] }
                          ]
                        }
                      ]
                    }
                  }
                }
              }
            }
          }
        },
        {
          $group: { _id: '$kind', total: { $sum: '$totalFee' } }
        },
        {
          $project: {
            x: '$_id',
            y: '$total'
          }
        }
      ]);
      ctx.body = {
        monthSalesTrend,
        monthNCTrend,
        weekSalesTrend,
        weekNCTrend,
        weekNSTrend,
        daySalesTrend,
        dayNCTrend,
        monthSalesPie
      };
    }
  }
  return Controller;
};
