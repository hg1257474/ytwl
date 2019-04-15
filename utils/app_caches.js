module.exports = function(app) {
  class caches {
    static setWeChatData(data) {
      this._weChatData = { ...this._weChatData, ...data };
    }
    static getWeChatData() {
      return this._weChatData;
    }
    static setResource(target,resource){
      this._resource[target]=resource
    }
    static getResource(target){
      return this._resource[target]
    }
  }
  caches._weChatData = {};
  caches._resource={}
  return caches;
};
