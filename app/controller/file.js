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
      this.ctx.body = this.ctx.request.files[0].filepath;
    }
  }
  return Controller;
};
