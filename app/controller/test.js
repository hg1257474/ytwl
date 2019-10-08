const fs = require('fs');
const path = require('path');

module.exports = app => {
  class Controller extends app.Controller {
    async wc() {
      const { ctx } = this;

      console.log(ctx.request.body);
      console.log(await ctx.parseXml());
      console.log('ok i just want fuck you');
      const res = `<xml>
      <ToUserName><![CDATA[${/openid=(.+)/.exec(ctx.request.href)[1]}]]></ToUserName>
      <FromUserName><![CDATA[wx69ecfe4e48d6981d]]></FromUserName>
      <CreateTime>${new Date().getTime()}</CreateTime>
      <MsgType><![CDATA[text]]></MsgType>
      <Content><![CDATA[你好]]></Content>
    </xml>`;
      console.log(res);
      ctx.body = res;
    }

    //  POST category
    async test() {
      // console.log(this.ctx.session)
      const { ctx } = this;
      // console.log("Dsd")
      const config = encodeURIComponent(
        JSON.stringify(this.service.weChat.jsSdkConfig(`http://localhost:7001/test`))
      );
      // console.log(config)
      await ctx.render('ads', { wxConfig: config });
    }

    async newGetFile() {
      const { params } = this.ctx;
      this.ctx.body = fs.readFileSync(`/resource/${params.target}/${this.ctx.params.id}`);
    }

    async getFile() {
      this.ctx.body = fs.readFileSync(
        `/resource/${this.ctx.params.target}/${this.ctx.params.fileName}`
      );
    }

    async weChat() {
      this.ctx.body = 'b28301fb48db34c85098e12a21f5e5c0';
    }

    async fuckasd() {
      this.ctx.body = '0f23df0df9864475447f93db743b3602';
    }

    async download() {
      const { ctx } = this;
      const data = fs.readFileSync(path.join(__dirname, 'download_page.html'));
      this.ctx.response.type = 'text/html';
      this.ctx.body = data.toString();
      ctx.response.set('Content-Disposition', 'attachment;filename=abc.html');
      console.log(ctx.body);
    }

    async resourceUpload() {
      const { ctx } = this;
      const {
        request: { body }
      } = ctx;
      const {
        model: { Static }
      } = ctx;
      if (ctx.method === 'OPTIONS') {
        ctx.body = 'success';
        return;
      }
      if (body.action === 'remove') {
        console.log('remove');
        await Static.deleteOne({
          type: 'test',
          'content.id': body.id
        }).exec();
      } else if (body.action === 'update') {
        console.log('update');
        await Static.deleteOne({
          type: 'test',
          'content.id': body.id
        }).exec();
        let target = new Static({ type: 'test', content: body });
        await target.save();
      } else {
        let target = new Static({ type: 'test', content: body });
        await target.save();
      }
      //let target = await Static.findOne({ type: "test" }).exec();
      /*
      if (!target) {
        target = new Static({ type: "test" ,content:{}});
        await target.save();
      }
      if(!target.content) target.content={}
      if (body.action === "remove") {
        delete target.content[body.id];
        target.content={...target.content}
      }
      if (body.action === "update") {
        delete body.action;
        target.content[body.id] = body;
        target.content={...target.content}
      }
      if (body.action === "add") {
        delete body.action;
        target.content[body.id] = body;
        target.content={...target.content}
      }
      console.log(target)
      await target.save();
      */
      ctx.body = 'success';
    }
  }
  return Controller;
};
