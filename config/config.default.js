/* eslint valid-jsdoc: "off" */
const os = require('os');
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
const path = require('path');

module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1555308285340_4405';
  config.multipart = {
    mode: 'file',
    fileSize: '10mb',
    fileExtensions: ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf'],
    tmpdir: path.join('/resource/tmp', os.tmpdir(), 'egg-multipart-tmp', appInfo.name),
    cleanSchedule: {
      cron: '0 30 4 * * *'
    }
  };
  config.proxy = true;
  config.bodyParser = {
    jsonLimit: '10mb',
    formLimit: '10mb'
  };
  config.view = {
    root: [
      path.join(appInfo.baseDir, 'app/view'),
      path.join(appInfo.baseDir, 'path/to/another')
    ].join(','),
    defaultViewEngine: 'nunjucks',
    defaultExtension: '.nj'
  };
  // add your middleware config here
  config.middleware = ['cors'];
  /*
  config.weChat = {
    appId: 'wx7cff6fb4f1177c46',
    appSecret: '9d79934d0e95c1f6d2158652a36ca61c',
    jsApiUrl: ['http://xcx.yitongnet.com/', 'https://www.huishenghuo.net/']
  };
  config.weChatPay = {
    mchId: 1510946171,
    key: 'XGSmEG6ClVz6OcVKx2N0qTbC40x5iyAA',
    callbackUrl: 'https://www.huishenghuo.net/customer/payment'
  };
  config.Customer = {
    appId: 'wxa3729a934847ddfb',
    secret: 'adb55a511fa5ddf0596fef9a5a98179c'
  };
  config.Servicer = {
    appId: 'wx5c2472a4f916d12c',
    secret: 'eb2157c76da17ab33b906adf889757a3'
  };
  */
  config.weChat = {
    appId: 'wxb205c34414f2f681',
    appSecret: 'd68fda98bf6e701bd56fd7733db79376',
    jsApiUrl: ['http://www.cyfwg.com/', 'http://xcx.yitongnet.com/', 'https://www.huishenghuo.net/']
  };
  config.weChatPay = {
    mchId: 1517356841,
    key: '47f74c6f36c07b94525a90f1ddb0cd17',
    callbackUrl: 'https://www.cyfwg.com/customer/payment' // 'https://www.huishenghuo.net/customer/payment'
  };
  config.Customer = {
    appId: 'wx32fe2bfaf622f032',
    secret: '7b7176655d450bc424e4ea31275755ba'
  };
  config.Servicer = {
    appId: 'wx1e4d9f6e4fc763c2',
    secret: 'e3479a91da6b55682a7330691bda89c4'
  };
  config.security = {
    xssProtection: {
      enable: false
    },
    xframe: {
      enable: false
    },
    hsts: {
      enable: false
    },
    noopen: {
      enable: false
    },
    nosniff: {
      enable: false
    },
    csrf: {
      enable: false
    },
    csp: {
      enable: false
    }
  };

  config.io = {
    init: {}, // passed to engine.io
    namespace: {
      '/service/customer': {
        connectionMiddleware: ['serviceCustomer'],
        packetMiddleware: [] // 针对消息的处理暂时不实现
      },
      '/service/servicer': {
        connectionMiddleware: ['serviceServicer'],
        packetMiddleware: [] // 针对消息的处理暂时不实现
      },
      '/chat': {
        connectionMiddleware: ['chat'],
        packetMiddleware: [] // 针对消息的处理暂时不实现
      }
    }
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  config.mongoose = {
    client: {
      url: 'mongodb://www.huishenghuo.net:27017/ytwl',
      options: { autoIndex: true, useFindAndModify: true }
      /*
      manager: {
        url: "mongodb://127.0.0.1/manager",
        options: {}
      },
      chat_record: {
        url: "mongodb://127.0.0.1/chat_record",
        options: {}
      },
      order: {
        url: "mongodb://127.0.0.1/order",
        options: {}
      },
      service: {
        url: "mongodb://127.0.0.1/service",
        options: {}
      }
      */
    }
  };

  return {
    ...config,
    ...userConfig
  };
};
