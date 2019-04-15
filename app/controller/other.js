const fs = require('fs');

module.exports = app => {
  class Controller extends app.Controller {
    async resource() {
      const { params } = this.ctx;
      this.ctx.body = fs.readFileSync(`/resource/${params.target}/${this.ctx.params.id}`);
    }
  }
  return Controller;
};
