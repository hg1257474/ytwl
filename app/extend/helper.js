const wordbook = {
  审核: 'review',
  合同: 'contract',
  咨询: 'communication',
  起草: 'draft'
};
module.exports = {
  formatQueryArg(arg) {
    console.log(arg);
    return arg.split(/-|\s+/).map(item => wordbook[item] || item);
  },
  getUniqueId: {
    mantissa: 0,
    temp() {
      return () => {
        this.mantissa = this.mantissa > 10000 ? this.mantissa % 10000 : (this.mantissa += 1);
        return `${Math.random()
          .toString()
          .slice(2, 10)}x${new Date().getTime()}x${this.mantissa}`;
      };
    }
  }.temp(),
  objectIdEqual: (x, y) =>
    (x === undefined ? undefined : x.toString()) === (y === undefined ? undefined : y.toString())
};
