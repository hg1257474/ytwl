const fs = require('fs');
const Egg = require('egg');
const path = require('path');

class FileService extends Egg.Service {
  async create(data, target) {
    return new Promise(async resolve => {
      const uniqueId = this.ctx.helper.getUniqueId();
      fs.writeFileSync(
        path.join(`/resource/${target}/`, uniqueId),
        // typeof data === 'string' && data.includes('base64')
        // ?
        Buffer.from(data.split('base64,')[1], 'base64')
        // : data
      );
      resolve(uniqueId);
    });
  }
}
module.exports = FileService;
