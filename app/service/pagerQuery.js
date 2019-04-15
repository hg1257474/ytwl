const Service = require("egg").Service;
class PagerQuery extends Service {
  async query(target, projector) {
    return new Promise(async (resolve, reject) => {
      const {
        ctx,
        ctx: { model }
      } = this;
      const total = await model[target].estimatedDocumentCount().exec();
      let data = null;
      if (ctx.query.start) {
        data = await model[target]
          .find(
            { _id: { $lt: mongoose.Schema.Types.ObjectId(ctx.query.start) } },
            projector
          )
          .sort({ _id: -1 })
          .limit(10)
          .exec();
      } else if (ctx.query.end) {
        data = await model[target]
          .find(
            { _id: { $gt: mongoose.Schema.Types.ObjectId(ctx.query.end) } },
            projector
          )
          .limit(10)
          .exec();
      }
      ctx.body = { total, data };
      ctx.status = 200;
      resolve();
    });
  }
}
module.exports = PagerQuery;
