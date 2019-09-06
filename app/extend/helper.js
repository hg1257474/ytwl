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
  }
};
