module.exports = app => {
    class Controller extends app.Controller {
      // GET start end
      async index() {
        await this.ctx.service.pagerQuery.query("Servicer", {});
      }
      // GET | DELETE | PUT | POST    id
      async detail() {
        const {
          ctx,
          ctx: {
            model: { Servicer }
          }
        } = this;
  
        switch (ctx.method) {
          case "POST": {
            const servicer = new Servicer(ctx.request.body);
            await servicer.save();
            ctx.status = 201;
            break;
          }
          case "GET":
            ctx.body = await Servicer.findById(ctx.params.id).exec();
            break;
          case "PUT": {
            let servicer = await Servicer.findById(ctx.params.id).exec();
            servicer = servicer.toObject();
            for (let key in ctx.body) {
              servicer[key] = ctx.body[key];
            }
            await servicer.save();
            break;
          }
          case "DELETE":
            await Servicer.deleteOne({ _id: ctx.params.id }).exec();
            break;
          default:
            throw new Error("servicer switch error");
        }
      }
    }
    return Controller;
  };
  