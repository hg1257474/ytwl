//'use strict';
module.exports = app => {
  class Controller extends app.Controller {
    // POST [sessionId , question , category ,service , type]
    async index(){
      //console.log(this.request.body)
      //console.log(this.request.queries)
      this.ctx.body="success"
    }
  }
  return Controller;
};
