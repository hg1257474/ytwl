const jimp=require('jimp')
module.exports = function(app) {
  const methods = {};
  methods.getThumbnail = async function(origin) {
    // console.log("__________________________________________");
    const origin_b = Buffer.from(origin.split("base64,")[1], "base64");
    // console.log(origin_b);
    let image = await jimp.read(origin_b);
    //console.log(image)
    let result = image;
    image = image.bitmap;
    let maxEdge = Math.max(image.width, image.height);
    let ratio = image.width / image.height;
    //console.log(b)
    if (maxEdge > 270) {
      if (ratio > 3 || ratio < 1 / 3)
        result = result.cover(
          maxEdge === image.width ? image.height * 3 : image.width,
          maxEdge === image.width ? image.height : image.width * 3,
          jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE
        );
      //console.log(result);
      result = result.scaleToFit(270, 270);
      //result.writeAsync("test1.jpg");
      //console.log(result.getBase64Async(jimp.MIME_PNG));
      return result.getBase64Async(jimp.MIME_PNG);
      // return res
    }
    return origin;
  };
  methods.isAvatarValid = function(x) {
    return !!x;
  };
  methods.getUniqueId = {
    mantissa: 0,
    temp() {
      return () => {
        this.mantissa =
          this.mantissa > 10000 ? this.mantissa % 10000 : ++this.mantissa;
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
