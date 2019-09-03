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
  }
  return Controller;
};
