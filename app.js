// app.js
const session = {};

module.exports = _app => {
  const app = _app;
  // 挂载 strategy
  // 添加getUnique函数 输出唯一id值
  app.beforeStart(async () => {
    const {
      model: { Resource, Servicer }
    } = app;
    app.cache = new Proxy(
      {},
      {
        set: function setValue(_obj, prop, value) {
          const obj = _obj;
          if (prop === 'lawyerExhibition') {
            (async () => {
              const lawyerExhibition = await Resource.findOne({
                category: 'lawyerExhibition'
              }).exec();
              const lawyers = [];
              for (const id of lawyerExhibition.content) {
                lawyers.push(
                  await Servicer.findById(id)
                    .select('avatar expert name')
                    .lean()
                );
              }
              obj[prop] = {
                content: lawyers,
                updatedAt: lawyerExhibition.updatedAt
              };
            })();
          } else obj[prop] = value;
          return true;
        }
      }
    );
    app.cache.lawyerExhibition = 0;
    app.cache.indexPageBanner = await Resource.findOne({
      category: 'indexPageBanner'
    }).exec();
    app.cache.product = await Resource.findOne({ category: 'product' }).exec();
    app.cache.indexPageColumn = await Resource.findOne({ category: 'indexPageColumn' }).exec();
    app.sessionStore = {
      async get(key) {
        let result = session[key];
        if (result) {
          result = { ...result };
          const entity = await app.model[result.entity.target].findById(result.entity.id).exec();
          if (!entity || entity.openId !== result.entity.openId) result = undefined;
          else result.entity = entity;
        }
        return result;
      },
      async set(key, _value) {
        const value = _value;
        value.entity = {
          id: value.entity.id,
          openId: value.entity.openId,
          target: value.entity.privilege ? 'Servicer' : 'Customer'
        };
        session[key] = value;
      },
      async destroy(key) {
        delete session[key];
      }
    };
  });
};
