const fs = require('fs');
const officegen = require('officegen');

module.exports = app => {
  class Controller extends app.Controller {
    // GET start end
    async index() {
      const { ctx } = this;
      const { query } = ctx;
      const args = [];
      const matchArgs = [];
      args.push({
        $match: { conclusion: { $exists: true }, name: { $all: [ctx.query.category] } }
      });
      if (query.isServiceNameFiltered) {
        matchArgs.push({
          $or: [
            { tServiceName: { $all: ctx.helper.formatQueryArg(query.isServiceNameFiltered) } },
            {
              description: {
                $regex: new RegExp(
                  ctx.helper
                    .formatQueryArg(query.isServiceNameFiltered)
                    .reduce((prev, cur) => `${prev}(?=.*${cur})`, '')
                )
              }
            }
          ]
        });
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
          tServiceName: '$name',
          serviceName: {
            $cond: {
              if: {
                $eq: ['review', { $arrayElemAt: ['$name', 3] }]
              },
              then: '$name',
              else: '$description'
            }
          },
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

    async archive() {
      const { ctx } = this;
      const args = [];
      const docx = officegen('docx');
      args.push({
        $match: { conclusion: { $exists: true }, name: { $all: ['communication'] } }
      });
      args.push({
        $match: {
          $expr: { $not: [{ $eq: [{ $arrayElemAt: ['$conclusion', 0] }, null] }] },
          updatedAt: {
            $gte: new Date(ctx.params.filename.split('至')[0]),
            $lte: new Date(ctx.params.filename.split('至')[1].split('.')[0])
          }
        }
      });

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
          description: 1,
          conclusion: { $arrayElemAt: ['$conclusion', 0] },
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
      args.push({ $sort: { _id: -1 } });
      for (const conclusion of await ctx.model.Service.aggregate(args)) {
        let pObj = docx.createP({ indentFirstLine: 460 });
        pObj.addText(`【${conclusion.serviceName[0]}】${conclusion.description}`, {
          font_size: 12,
          bold: true
        });
        pObj = docx.createP({ indentFirstLine: 575 });
        pObj.addText(conclusion.conclusion, {
          font_size: 12
        });
      }
      const filename = `/resource/temp/${new Date().getTime()}${ctx.params.filename}`;
      await new Promise(resolve => {
        const out = fs.createWriteStream(filename);
        out.on('close', () => {
          ctx.body = fs.readFileSync(filename);
          resolve();
        });
        docx.generate(out);
      });
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
