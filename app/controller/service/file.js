const path = require('path');

const fs = require('fs');

const _files = {};

module.exports = app => {
  class Controller extends app.Controller {
    async index() {
      const { ctx } = this;
      ctx.body = 'success';
      switch (ctx.method) {
        case 'POST':
          if (ctx.query.isDirect) ctx.body = ctx.request.files[0].filepath;
          else {
            const id = this.app.methods.getUniqueId();
            _files[id] = {};
            ctx.body = id;
          }
          break;
        case 'GET':
          if (ctx.query.target === 'uploadedPage') {
            ctx.body = fs.readFileSync(path.join(__dirname, 'upload.html'));
            this.ctx.response.type = 'text/html';
            this.ctx.response.set('Content-Type', 'text/html;charset=utf-8');
            this.ctx.response.set('Cache-Control', 'no-cache');
          } else ctx.body = _files[ctx.query.tempFileId];
          break;
        case 'PUT':
          if (_files[ctx.query.tempFileId]) {
            ctx.request.body[2] = `/resource/temp/${await ctx.service.file.create(
              ctx.request.body[2],
              'temp'
            )}`;
            _files[ctx.query.tempFileId] = ctx.request.body;
          }
          break;
        default:
          throw new Error('dsd');
      }
    }
  }
  return Controller;
};
