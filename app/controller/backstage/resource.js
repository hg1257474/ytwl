// query [page,target,categorySelected]
function getList(query, rawData) {
  const resources = [];
  let total = 0;
  if (query.target === 'indexPageCategory') {
    total = rawData.length;
    for (
      let key = (query.current - 1) * 10;
      key < query.current * 10 && key < rawData.length;
      key += 1
    ) {
      resources.push(rawData[key][0]);
    }
  } else if (query.target === 'indexPageTerm') {
    const terms = rawData[query.indexPageCategorySelected][1];
    total = terms.length;
    for (let key = (query.current - 1) * 10; key < query.current * 10 && key < total; key += 1) {
      resources.push(terms[key]);
    }
  }

  console.log(total);
  return { resources, total };
}
module.exports = app => {
  class Controller extends app.Controller {
    // GET start end
    async index() {
      const { ctx } = this;
      let resource = null;
      if (ctx.query.target.includes('indexPage'))
        resource = this.app.caches.getResource('indexPage').content;
      ctx.body = getList(ctx.query, resource);
    }

    // GET | DELETE | PUT | POST    id
    async updateItem() {
      const { ctx } = this;
      const { query } = ctx;
      const { body } = ctx.request;
      let resource = null;
      let tempResource = null;
      console.log(query);
      console.log(body);
      if (query.target.includes('indexPage')) {
        resource = this.app.caches.getResource('indexPage');
        tempResource = resource.content;
        if (query.target === 'indexPageTerm') {
          tempResource[body.oldCategory][1].splice(body.oldIndex, 1);
          tempResource[body.category][1].splice(body.index, 0, [
            [body.termIcon[0], await ctx.service.file.create(body.termIcon[1], 'indexPage')], //body.termIcon?"":"",
            body.term,
            body.termDescription,
            body.termOther
          ]);
          console.log(tempResource[body.category][1][body.index]);
        } else {
          const terms = tempResource[body.oldIndex][1];
          tempResource.splice(body.oldIndex, 1);
          tempResource.splice(body.index, 0, [body.category, terms]);
        }
      }
      console.log(tempResource);
      resource.markModified('content');
      await resource.save();
      ctx.body = getList(query, tempResource);
    }

    async deleteItem() {
      const { ctx } = this;
      const { query } = ctx;
      let tempResource = null;
      let resource = null;
      if (query.target.includes('indexPage')) {
        resource = this.app.caches.getResource('indexPage');
        tempResource = resource.content;
        if (query.target !== 'indexPageCategory')
          resource[query.indexPageCategorySelected][1].splice(query.index, 1);
        else tempResource.splice(query.inputTarget, 1);
      }
      resource.markModified('content');
      await resource.save();
      ctx.body = getList(query, tempResource);
    }

    async newItem() {
      const { ctx } = this;
      const { body } = ctx.request;
      const { query } = ctx;
      let tempResource = null;
      let resource = null;
      if (query.target.includes('indexPage')) {
        resource = this.app.caches.getResource('indexPage');
        tempResource = resource.content;
        if (body.term) {
          tempResource
            .find(item => item[1] === body.category)[3]
            .splice(body.index, 0, [
              await ctx.service.file.create(body.termIcon[1], 'indexPage', body.termIcon[0]),
              body.term,
              body.termSummary,
              body.termDescription
            ]);
        } else {
          tempResource.splice(body.index, 0, [body.category, []]);
        }
      }
      resource.markModified('content');
      await resource.save();
      ctx.body = getList(query, tempResource);
    }

    async other() {
      const { ctx } = this;
      const { query } = ctx;
      let result = null;
      let resource = null;
      if (ctx.params.target.includes('index_page'))
        resource = this.app.caches.getResource('indexPage').content;
      switch (ctx.params.target) {
        case 'index_page_term_total':
          result = resource[query.category][1].length;
          break;
        case 'index_page_category_total':
          result = resource.length;
          break;
        case 'index_page_categories':
          result = resource.map(item => item[0]);
          break;
        default:
          throw new Error('dsds');
      }
      ctx.body = result;
    }
  }
  return Controller;
};
