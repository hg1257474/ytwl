module.exports = app => {
  class Controller extends app.Controller {
    // PUT
    async lawyerExhibition() {
      const { ctx } = this;
      const lawyerExhibition = this.app.caches.getResource('lawyerExhibition');
      if (ctx.query.target === 'id_list') {
        console.log(lawyerExhibition);
        ctx.body = lawyerExhibition.content.map(item => item._id);
      } else if (
        new Date(ctx.query.updatedAt).getTime() !== new Date(lawyerExhibition.updatedAt).getTime()
      ) {
        console.log(ctx.query.updatedAt, lawyerExhibition.updatedAt);
        ctx.body = lawyerExhibition;
      } else ctx.body = 'newest';
    }

    async indexPageBanner() {
      const { ctx } = this;
      const indexPageBanner = app.caches.getResource('indexPageBanner');
      if (ctx.method === 'GET') {
        if (ctx.query.updatedAt) {
          if (
            new Date(ctx.query.updatedAt).getTime() ===
            new Date(indexPageBanner.updatedAt).getTime()
          )
            ctx.body = 'newest';
          else ctx.body = indexPageBanner;
        } else ctx.body = indexPageBanner.content;
      } else {
        const { body } = ctx.request;
        indexPageBanner.content =
          body.length === 2 ? body : [body[0], await ctx.service.file.create(body[1], 'indexPage')];
        await indexPageBanner.save();
        ctx.body = indexPageBanner.content;
      }
    }
  }
  return Controller;
};
