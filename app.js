// app.js
const { data: tdata } = require('./miniprogram_data');
const { lawyerAvatar, HOUQIFENG, LVZHIHE, WANGGUIBIN, DUANLUYI } = require('./lawyer_avatar');
function temp1(app) {
  class Session {
    static async get(id) {
      // console.log(id);
      console.log(this._sessions);
      let result = this._sessions[id];
      if (result) {
        result = { ...result };
        const entity = await app.model[result.entity.target].findById(result.entity.id).exec();
        // console.log(entity);
        // console.log(result);
        if (!entity || entity.openId !== result.entity.openId) result = undefined;
        else result.entity = entity;
      }
      return result;
    }

    static add(id, value) {
      value.entity = {
        id: value.entity.id,
        openId: value.entity.openId,
        target: value.entity.privilege ? 'Servicer' : 'Customer'
      };
      this._sessions[id] = value;
    }

    static remove(id) {
      delete this._sessions[id];
    }
  }
  Session._sessions = {};
  return Session;
}

module.exports = app => {
  // 挂载 strategy
  // 添加getUnique函数 输出唯一id值
  app.methods = require('./utils/app_methods')(app);
  app.caches = require('./utils/app_caches')(app);
  app.sessions = temp1(app);

  app.beforeStart(async () => {
    const {
      model: { Resource, Servicer }
    } = app;
    let payPage = await Resource.findOne({ category: 'payPage' }).exec();
    if (!payPage) {
      payPage = new Resource({
        category: 'payPage',
        content: tdata.payPage
      });
      await payPage.save();
    }
    let indexPage = await Resource.findOne({ category: 'indexPage' }).exec();
    if (!indexPage) {
      indexPage = new Resource({
        category: 'indexPage',
        content: tdata.indexPage
      });
      await indexPage.save();
    }
    let lawyerExhibition = await Resource.findOne({ category: 'lawyerExhibition' }).exec();
    if (!lawyerExhibition) {
      lawyerExhibition = new Resource({
        category: 'lawyerExhibition',
        content: []
      });
      await lawyerExhibition.save();
    }
    lawyerExhibition = {
      content: await Servicer.find(
        { _id: { $in: lawyerExhibition.content } },
        { avatar: 1, expert: 1, name: 1 }
      ).lean(),
      updatedAt: lawyerExhibition.updatedAt
    };
    let indexPageBanner = await Resource.findOne({ category: 'indexPageBanner' }).exec();
    if (!indexPageBanner) {
      indexPageBanner = new Resource({
        category: 'indexPageBanner'
      });
    }
    app.caches.setResource('indexPageBanner', indexPageBanner);
    app.caches.setResource('lawyerExhibition', lawyerExhibition);
    app.caches.setResource('payPage', payPage);
    app.caches.setResource('indexPage', indexPage);
    /*
    const delResource = async () => {
      const _resource = await app.model.Resource.findOne({ category: 'indexPage' }).exec();
      _resource.content = _resource.content.map(item => [item[1], item[3]]);
      await _resource.save();
    };
    delResource()
    */
    /*
    const newServicers = [
      {
        username: 'houqifeng',
        password: 'houqifeng',
        name: '侯其锋',
        avatar: HOUQIFENG,
        grade: 10,
        serviceTotal: 20,
        expert: '股权设计、股权融资、上市辅导及常年法律顾问服务',
        privilege: { canProcessingService: true }
      },
      {
        username: 'lvzhihe',
        password: 'lvzhihe',
        name: '吕志合',
        avatar: LVZHIHE,
        grade: 10,
        serviceTotal: 20,
        expert: '税法咨询、税收筹划，涉税民事、行政和刑事诉讼案件的代理和辩护',
        privilege: { canProcessingService: true }
      },
      {
        username: 'wangguibin',
        password: 'wangguibin',
        name: '王贵斌',
        avatar: WANGGUIBIN,
        grade: 10,
        serviceTotal: 20,
        expert:
          '特许经营法律、法规、政策咨询，起草、审查特许经营合同，特许经营项目的策划、设计和调研',
        privilege: { canProcessingService: true }
      },
      {
        username: 'duanluyi',
        password: 'duanluyi',
        name: '段鲁艺',
        avatar: DUANLUYI,
        grade: 10,
        serviceTotal: 20,
        expert: '商标、专利、著作权等知识产权的申请、维护、维权',
        privilege: { canProcessingService: true }
      }
    ];
    const hasNewServicers = await Servicer.findOne({ name: '侯其锋' }).exec();
    if (!hasNewServicers) {
      Servicer.insertMany(newServicers);
    }
    */
    const haveServicer = await Servicer.findOne().exec();
    if (!haveServicer) {
      const data = [
        {
          username: 'admin',
          password: 'admin',
          privilege: { canAssignService: true, canManageServicer: true }
        },
        {
          username: 'manager',
          password: 'manager',
          privilege: { canAssignService: true }
        },
        {
          username: 'lawyer',
          password: 'lawyer',
          name: '张律师',
          avatar: lawyerAvatar,
          grade: 10,
          serviceTotal: 20,
          expert: '账务问题、合同咨询',
          privilege: { canProcessingService: true }
        }
      ];
      Servicer.insertMany(data);
    }
    app.sessionStore = {
      async get(key) {
        return app.sessions.get(key);
      },
      async set(key, value, maxAge) {
        app.sessions.add(key, value, value);
      },
      async destroy(key) {
        app.session.remove(key);
      }
    };
  });
};
