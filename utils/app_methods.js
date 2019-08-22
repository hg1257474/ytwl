module.exports = function(app) {
  const methods = {};
  methods.getUniqueId = {
    mantissa: 0,
    temp() {
      return () => {
        this.mantissa = this.mantissa > 10000 ? this.mantissa % 10000 : ++this.mantissa;
        return `${Math.random()
          .toString()
          .slice(2, 10)}x${new Date().getTime()}x${this.mantissa}`;
      };
    }
  }.temp();
  methods.objectIdEqual = function(x, y) {
    x = x !== undefined && x.toString();
    y = y !== undefined && y.toString();
    return x === y;
  };
  methods.wxPushService = function(formId, message) {};

  return methods;
};
