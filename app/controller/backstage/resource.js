const fs = require('fs');

module.exports = app => {
  class Controller extends app.Controller {
    // GET start end
    async index() {
      const { ctx } = this;
      const indexPageColumn = app.cache.indexPageColumn.content;
      const current = ctx.query.current || 1;
      switch (ctx.params.target) {
        case 'index_page_category_list':
          ctx.body = {
            total: indexPageColumn.length,
            content: Array.from({
              length:
                current * 10 > indexPageColumn.length
                  ? indexPageColumn.length - (current - 1) * 10
                  : 10
            }).map((x, index) => indexPageColumn[(current - 1) * 10 + index][0])
          };
          break;
        case 'index_page_term_list':
          if (!indexPageColumn[ctx.query.category]) ctx.body = { category: -1, content: [] };
          else
            ctx.body = {
              category: Number(ctx.query.category),
              content: indexPageColumn[ctx.query.category][1].map(item => item.slice(0, 2))
            };
          break;
        case 'index_page_categories':
          ctx.body = indexPageColumn.map(item => item[0]);
          break;
        case 'index_page_term_total':
          if (Number.isNaN(ctx.query.category)) ctx.statusCode = 400;
          else ctx.body = indexPageColumn[ctx.query.category][1].length;
          break;
        case 'index_page_banner':
          ctx.body = app.cache.indexPageBanner.content;
          break;
        case 'product':
          ctx.body = app.cache.product.content[ctx.query.product];
          break;
        case 'product_list':
          ctx.body = app.cache.product.content.map(item => {
            const temp = { ...item };
            delete temp.description;
            return temp;
          });
          break;
        case 'index_page_term':
          ctx.body = indexPageColumn[ctx.query.category][1][ctx.query.term];
          break;
        default:
          ctx.body = 404;
      }
    }

    // GET | DELETE | PUT | POST    id
    async _update() {
      const { ctx } = this;
      const { body } = ctx.request;
      const { indexPageColumn } = app.cache;
      const _app = app;
      switch (ctx.params.target) {
        case 'index_page_category': {
          const terms = indexPageColumn.content[body.oldIndex][1];
          indexPageColumn.content.splice(body.oldIndex, 1);
          indexPageColumn.content.splice(body.index, 0, [body.category, terms]);
          break;
        }
        case 'index_page_term': {
          if (body.termOther instanceof Array) {
            body.termOther.forEach(item => {
              if (item[1].includes('resource/tmp')) {
                const uniqueId = ctx.helper.getUniqueId();
                fs.copyFileSync(item[1], `/resource/free/${uniqueId}`);
                const _item = item;
                _item[1] = uniqueId;
              }
            });
          }
          indexPageColumn.content[body.oldCategory][1].splice(body.oldIndex, 1);
          indexPageColumn.content[body.category][1].splice(body.index, 0, [
            [
              body.termIcon[0],
              body.termIcon[1].includes('base64,')
                ? await ctx.service.file.create(body.termIcon[1], 'indexPage')
                : body.termIcon[1]
            ],
            body.term,
            body.termDescription,
            body.termOther
          ]);
          indexPageColumn.markModified('content');
          await indexPageColumn.save();
          break;
        }
        case 'index_page_banner':
          _app.cache.indexPageBanner.content = [
            body[0],
            await ctx.service.file.create(body[1], 'indexPage')
          ];
          await _app.cache.indexPageBanner.save();
          await indexPageColumn.save();
          break;
        case 'product':
          _app.cache.product.content.forEach((item, index) => {
            if (item.name === body.name) _app.cache.product.content[index] = body;
          });
          app.cache.product.markModified('content');
          await _app.cache.product.save();
          break;
        default:
          ctx.statusCode = 400;
      }
      if (ctx.statusCode !== 400) ctx.body = 'success';
    }

    async _delete() {
      const { ctx } = this;
      const { query } = ctx;
      const { indexPageColumn } = app.cache;
      switch (ctx.params.target) {
        case 'index_page_category':
          indexPageColumn.content.splice(query.category, 1);
          indexPageColumn.markModified('content');
          await indexPageColumn.save();
          break;
        case 'index_page_term':
          indexPageColumn.content[query.category][1].splice(query.term, 1);
          indexPageColumn.markModified('content');
          await indexPageColumn.save();
          break;
        default:
          ctx.statusCode = 400;
      }
      if (ctx.statusCode !== 400) ctx.body = 'success';
    }

    async _new() {
      const { ctx } = this;
      const { body } = ctx.request;
      const { indexPageColumn } = app.cache;
      switch (ctx.params.target) {
        case 'index_page_category':
          indexPageColumn.content.splice(body.index, 0, [body.category, []]);
          indexPageColumn.markModified('content');
          await indexPageColumn.save();
          break;
        case 'index_page_term':
          if (body.termOther instanceof Array) {
            body.termOther.forEach(item => {
              const uniqueId = ctx.helper.getUniqueId();
              fs.copyFileSync(item[1], `/resource/free/${uniqueId}`);
              const _item = item;
              _item[1] = uniqueId;
            });
          }
          indexPageColumn.content[body.category][1].splice(body.index, 0, [
            [body.termIcon[0], await ctx.service.file.create(body.termIcon[1], 'indexPage')],
            body.term,
            body.termDescription,
            body.termOther
          ]);
          indexPageColumn.markModified('content');
          await indexPageColumn.save();
          break;
        default:
          ctx.statusCode = 400;
      }
      if (ctx.statusCode !== 400) ctx.body = 'success';
    }
  }
  return Controller;
};
