const Crypto = require('crypto');
const Service = require('egg').Service;
const http = require('http');
const TEMPLATE = `<xml>
<appid>wxa3729a934847ddfb</appid>
<body>thi-eqwe</body>
<mch_id>1510946171</mch_id>
<nonce_str>dsdsdfdd121</nonce_str>
<openid>oA6C84heEWDC0kbuZx1GiS3q3Kps</openid>
<out_trade_no>11221</out_trade_no>
<spbill_create_ip>221.206.100.135</spbill_create_ip>
<total_fee>1</total_fee>
<trade_type>JSAPI</trade_type>
<notify_url>http://www.huishenghuo.net</notify_url>
<sign>C5980A58ED9F3067DE68358F03C1158C</sign>
</xml>`;
const getMD5 = (param, key) => {
  let temp = [];
  for (let [index, value] of Object.entries(param)) {
    if (value) {
      temp.push(`${index}=${value}`);
    }
  }
  temp.sort();
  temp.push(`key=${key}`);
  temp = temp.join('&');
  return Crypto.createHash('md5')
    .update(temp)
    .digest('hex')
    .toUpperCase();
};
const getRequestParam = param => {
  let result = '<xml>';
  for (let [index, value] of Object.entries(param)) {
    if (!value) continue;
    result += `<${index}>${index === 'detail' ? '<![CDATA[' : ''}${value}${
      index === 'detail' ? ']]>' : ''
    }</${index}> `;
  }
  result += '</xml>';
  return result;
};
const templates = {
  newService: '7cTJKG4_Unyk-iVQf9CachmmNjD9hErF4ORWcbKkojw'
};
const pushMessageUrl = 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=';
class WeChatService extends Service {
  async getOpenId(target) {
    return new Promise(async resolve => {
      const { config } = this;
      //console.log(config);
      const res = await this.app.curl(
        `https://api.weixin.qq.com/sns/jscode2session?appid=${config[target].appId}&secret=${config[target].secret}&js_code=${this.ctx.request.body.jsCode}&grant_type=authorization_code`,
        {
          dataType: 'json'
        }
      );
      resolve(res.data.openid);
    });
  }

  async pushMessage(type, service) {
    const templateIds = {
      newService: 'oZqTW85wuhPJnwnTQLI7FkF4Nh521LfIg_REO_rnglI',
      payment: 'pTOjmM_HHQ-6cNr19zKfCD4MSq0S7JWMT2VMNGaUDLM'
    };
    const categories = { contract: '合同', communication: '咨询', draft: '起草', review: '审核' };
    function getFormatTime(_time) {
      const time = new Date(new Date(_time).getTime() + 1000 * 8 * 3600);
      return `${time.getUTCFullYear()}-${time.getUTCMonth()}-${time.getUTCDate()} ${time.getUTCHours()}:${time.getUTCMinutes()}:${time.getUTCSeconds()}`;
    }
    console.log(service);
    let message;
    if (type === 'newService') {
      message = {
        keyword1: {
          value: `${service.name[0]}-${service.name[1]}-${categories[service.name[2]]}-${categories[
            service.name[3]
          ] || ''}`
        },
        keyword2: {
          value:
            service.name[3] === 'review'
              ? '请登录小程序查看合同内容'
              : service.description.slice(0, 100)
        },
        keyword3: { value: getFormatTime(service.createdAt) },
        remark: { value: '点击处理请求' }
      };
    } else {
      message = {
        keyword1: { value: service._id },
        keyword2: {
          value: `${service.totalFee}元`
        },
        keyword3: {
          value: '微信'
        },
        keyword4: { value: getFormatTime(service.updatedAt) },
        remark: { value: '点击分配服务' }
      };
    }
    const servicers = await this.app.model.Servicer.find(
      { 'privilege.canManageServicer': true, oAOpenId: { $exists: true } },
      'oAOpenId'
    ).exec();
    return new Promise(async resolve => {
      for (const servicer of servicers) {
        console.log('11111');
        console.log(message);
        const res = await this.ctx.curl(pushMessageUrl + this.app.cache.accessToken, {
          method: 'POST',
          contentType: 'json',
          data: {
            touser: servicer.oAOpenId,
            template_id: templateIds[type],
            miniprogram: {
              appid: this.config.Servicer.appId,
              pagepath: 'pages/index/index'
            },
            data: message
          }
        });
        console.log(res);
      }
      resolve();
    });
  }

  getJsSdkConfig(url) {
    const debug = true;
    const jsApiList = ['previewImage'];
    const timestamp = Math.ceil(this.app.mongoose.now().getTime() / 1000);
    const nonceStr = this.ctx.helper.getUniqueId().slice(0, 16);
    const { appId } = this.config.weChat;
    const { jsApiTicket } = this.app.cache;
    const raw = `jsapi_ticket=${jsApiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
    const signature = Crypto.createHash('sha1')
      .update(raw)
      .digest('hex');
    return {
      appId,
      timestamp,
      nonceStr,
      signature,
      jsApiList,
      debug
    };
  }

  async getPayConfig(order) {
    // console.log(this);
    const {
      app: { config },
      ctx: {
        helper: { getUniqueId },
        request: { ip }
      }
    } = this;
    const nonceStr = getUniqueId().slice(0, 16);
    return new Promise(async (resolve, reject) => {
      const param = {
        appid: config.Customer.appId,
        mch_id: config.weChatPay.mchId,
        nonce_str: nonceStr,
        // sign
        body: order.name,
        out_trade_no: order._id.toString(),
        total_fee: order.description.pointDeduction
          ? order.totalFee * 100 - order.description.pointDeduction * 100
          : order.totalFee * 100,
        spbill_create_ip: ip,
        notify_url: config.weChatPay.callbackUrl,
        trade_type: 'JSAPI',
        openid: this.ctx.session.entity.openId
      };
      console.log(param);

      param.sign = getMD5(param, config.weChatPay.key);

      const res = await this.app.curl('https://api.mch.weixin.qq.com/pay/unifiedorder', {
        method: 'POST',
        content: getRequestParam(param),
        headers: {
          'content-type': 'text/xml'
        }
      });
      console.log(res.data.toString());

      const prepayId = res.data.toString().match(/<prepay_id><!\[CDATA\[(.+)\]\]><\/prepay_id>/)[1];
      console.log(prepayId);
      const clientParam = {
        appId: config.Customer.appId,
        timeStamp: order.createdAt.getTime().toString(),
        nonceStr,
        package: `prepay_id=${prepayId}`,
        signType: 'MD5'
      };
      clientParam.paySign = getMD5(clientParam, config.weChatPay.key);
      resolve(clientParam);
    });
  }
}
module.exports = WeChatService;

/*
debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    appId: '', // 必填，公众号的唯一标识
    timestamp: , // 必填，生成签名的时间戳
    nonceStr: '', // 必填，生成签名的随机串
    signature: '',// 必填，签名
    jsApiList: [] // 必填，需要使
小程序ID	appid	是	String(32)	wxd678efh567hg6787	微信分配的小程序ID</addid> 
商户号	mch_id	是	String(32)	1230000109	微信支付分配的商户号
设备号	device_info	否	String(32)	013467007045764	自定义参数，可以为终端设备号(门店号或收银设备ID)，PC网页或公众号内支付可以传"WEB"
随机字符串	nonce_str	是	String(32)	5K8264ILTKCH16CQ2502SI8ZNMTM67VS	随机字符串，长度要求在32位以内。推荐随机数生成算法
签名	sign	是	String(32)	C380BEC2BFD727A4B6845133519F3AD6	通过签名算法计算得出的签名值，详见签名生成算法
签名类型	sign_type	否	String(32)	MD5	签名类型，默认为MD5，支持HMAC-SHA256和MD5。
商品描述	body	是	String(128)	腾讯充值中心-QQ会员充值	
商品简单描述，该字段请按照规范传递，具体请见参数规定

商品详情	detail	否	String(6000)	 	商品详细描述，对于使用单品优惠的商户，改字段必须按照规范上传，详见“单品优惠参数说明”
附加数据	attach	否	String(127)	深圳分店	附加数据，在查询API和支付通知中原样返回，可作为自定义参数使用。
商户订单号	out_trade_no	是	String(32)	20150806125346	商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*且在同一个商户号下唯一。详见商户订单号
标价币种	fee_type	否	String(16)	CNY	符合ISO 4217标准的三位字母代码，默认人民币：CNY，详细列表请参见货币类型
标价金额	total_fee	是	Int	88	订单总金额，单位为分，详见支付金额
终端IP	spbill_create_ip	是	String(64)	123.12.12.123	支持IPV4和IPV6两种格式的IP地址。调用微信支付API的机器IP
交易起始时间	time_start	否	String(14)	20091225091010	订单生成时间，格式为yyyyMMddHHmmss，如2009年12月25日9点10分10秒表示为20091225091010。其他详见时间规则
交易结束时间	time_expire	否	String(14)	20091227091010	
订单失效时间，格式为yyyyMMddHHmmss，如2009年12月27日9点10分10秒表示为20091227091010。订单失效时间是针对订单号而言的，由于在请求支付的时候有一个必传参数prepay_id只有两小时的有效期，所以在重入时间超过2小时的时候需要重新请求下单接口获取新的prepay_id。其他详见时间规则

建议：最短失效时间间隔大于1分钟

订单优惠标记	goods_tag	否	String(32)	WXG	订单优惠标记，使用代金券或立减优惠功能时需要的参数，说明详见代金券或立减优惠
通知地址	notify_url	是	String(256)	http://www.weixin.qq.com/wxpay/pay.php	异步接收微信支付结果通知的回调地址，通知url必须为外网可访问的url，不能携带参数。
交易类型	trade_type	是	String(16)	JSAPI	小程序取值如下：JSAPI，详细说明见参数规定
商品ID	product_id	否	String(32)	12235413214070356458058	trade_type=NATIVE时，此参数必传。此参数为二维码中包含的商品ID，商户自行定义。
指定支付方式	limit_pay	否	String(32)	no_credit	上传此参数no_credit--可限制用户不能使用信用卡支付
用户标识	openid	否	String(128)	oUpF8uMuAJO_M2pxb1Q9zNjWeS6o	trade_type=JSAPI，此参数必传，用户在商户appid下的唯一标识。openid如何获取，可参考【获取openid】。
电子发票入口开放标识	receipt	否	String(8)	Y	Y，传入Y时，支付成功消息和支付详情页将出现开票入口。需要在微信支付商户平台或微信公众平台开通电子发票功能，传此字段才可生效
+场景信息	scene_info	否	String(256)	

{"store_info" : {
"id": "SZTX001",
"name": "腾大餐厅",
"area_code": "440305",
"address": "科技园中一路腾讯大厦" }}

该字段常用于线下活动时的场景信息上报，支持上报实际门店信息，商户也可以按需求自己上报相关信息。该字段为JSON对象数据，对象格式为{"store_info":{"id": "门店ID","name": "名称","area_code": "编码","address": "地址" }} ，字段详细说明请点击行前的+展开
*/
