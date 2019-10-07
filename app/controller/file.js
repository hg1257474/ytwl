const path = require('path');
const fs = require('fs');
module.exports = app => {
  class Controller extends app.Controller {
    // PUT
    // async download_page() {
    //   const data = fs.readFileSync(path.join(__dirname, 'download_page.html'));
    //   this.ctx.response.type = 'text/html';
    //   this.ctx.body = data;
    // }

    async upload() {
      const { ctx } = this;
      const file = ctx.request.files[0];
      const name = 'egg-multipart-test/' + path.basename(file.filename);
      let result;
      try {
        // process file or upload to cloud storage
        result = await ctx.oss.put(name, file.filepath);
      } finally {
        // remove tmp files and don't block the request's response
        // cleanupRequestFiles won't throw error even remove file io error happen
        ctx.cleanupRequestFiles();
        // remove tmp files before send response
        // await ctx.cleanupRequestFiles();
      }

      ctx.body = {
        url: result.url,
        // get all field values
        requestBody: ctx.request.body
      };
    }
  }
  return Controller;
};
