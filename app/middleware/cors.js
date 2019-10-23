module.exports = options => {
  return async function gzip(ctx, next) {
    console.log(ctx.request.url);
    //onsole.log(ctx.request.body);
    console.log(ctx.request.href);
    console.log(ctx.method);
    if (
      ctx.header.cookie &&
      ctx.header.cookie.includes('EGG_SESS') &&
      !ctx.session.entity &&
      !ctx.request.href.includes('login')
    ) {
      ctx.body = 403;
      return 1;
    }
    if (
      ctx.request.href.includes('backstage') &&
      ctx.method !== 'OPTIONS' &&
      !ctx.request.href.includes('login') &&
      !ctx.session.entity
    ) {
      ctx.status = 403;
      return 1;
    }
    if (
      ctx.request.url.includes('customer/payment') ||
      ctx.request.url.includes('servicer/official_account') ||
      ctx.request.url.includes('wc')
    ) {
      ctx.parseXml = () =>
        new Promise(resolve => {
          if (ctx.query.orderId) resolve('');
          let data = '';
          ctx.req.on('data', chunk => (data += chunk));
          ctx.req.on('end', () => {
            // console.log(data.toString('utf-8'));
            ctx.xml = data.toString('utf-8');
            resolve(data.toString('utf-8'));
          });
        });
    }
    await next();

    // 后续中间件执行完成后将响应体转换成 gzip

    ctx.set({
      // "Access-Control-Allow-Origin": "http://www.huishenghuo.net:3000",
      // 'Access-Control-Allow-Origin': 'http://192.168.99.157:8000',
      // 'Access-Control-Allow-Origin': 'http://192.168.0.29:8000',
      'Access-Control-Allow-Origin': 'http://backstage.cyfwg.com',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type,X-Requested-With',
      'Access-Control-Allow-Methods': 'PUT,GET,POST,DELETE,OPTIONS'
    });

    //ctx.response.set("Content-Type","text/plain;charset=utf-8")
    //if (ctx.method === 'OPTIONS')
    // if (ctx.request.url.includes("/resource/") || ctx.request.url.includes("/test"))
    //ctx.set({
    //"Access-Control-Allow-Origin": "http://www.huishenghuo.net:3000",
    //'Access-Control-Allow-Origin': 'http://192.168.0.29:8000',
    //'Access-Control-Allow-Credentials': 'true',
    //'Access-Control-Allow-Headers': 'Content-Type,X-Requested-With'
    //});
  };
};
