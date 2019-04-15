const fs = require('fs');
const Egg = require('egg');
const path = require('path');

class FileService extends Egg.Service {
  async create(data, target) {
    return new Promise(async resolve => {
      const uniqueId = this.app.methods.getUniqueId();
      fs.writeFileSync(
        path.join(`/resource/${target}/`, uniqueId),
        typeof data === 'string'
          ? Buffer.from(data.includes('base64') ? data.split('base64,')[1] : '', 'base64')
          : data
      );
      //console.log(uniqueId);
      resolve(uniqueId);
    });
  }
}
module.exports = FileService;
