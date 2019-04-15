var jimp = require("jimp");
var fs=require('fs')
let ss=fs.readFileSync('tests.jpg');
const img = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAqCAYAAADI3bkcAAAEMUlEQVRYheXZa4gVdRjH8c+5uWoXWTXdiK7uKup6i0RTLDOx7E5QvZAi0AgisVeF9ELoTRAElhBBVBRdIAui0EztYiS7hZl2WQq11FzXG97N9VxmenGcPKyte87M4gr94MAzM8/D78v/zPyf/38mFYahXtJIPIaZaEQOO7AJH+FjBIldwjBM+hsYhuGrYRgWwnPrlzAMpyb1SyUc4cH4EhOg0LpWYf0awb52SkWp+stkR0+SHT9FpnEsdOIOfBXXMAlwCmsxq/Tnbzrff0XQsbPb5P7zFspNvRX2YhSOxDFNxyk6rYcwK9jX7uTrL5wTFjrfXab46wYYjifjmiYBXgD5dSuERw5WVVD4ZmUU3h/XNAnwFCh+V/3tWPz9pygcF9c0CXAOwqBUfUWpWFmbimOaBPgwpAZcVHVBauDFUXgIsZ72JMC7IT1ocNUFqTO5u+OaJgFu7wLRs1n90CjcFdc0LvAc3BUeOqC0ra3qotLWNsGBvXAb7o1jHBd4BBR/3SA8eaLqojDfqdi2ITq8Ko5xXOByl6rhgYuU6v9vzXntdB2QvrS+dsP6IVEY6z6OC7wZhUxTswELnqm6aMD8p2WaxkFBedlZs+ICH8R92JudcKNUFSOdumSQ7MRpsF/5gauun3dRkmltJVohM2JMj8mZxuYobMFncU2TAFNeC8tdP73HxNwNN0XhF0kMkwJ/gHx24jSZa0Z1m5RpapYdPwVO4r0khkmB9+BlqLt7XrdJdXMfisIXcSCJYVJgeBZ/ZEaOlx7acLbBkOHRzLAdzyU16w3gPMrtrl/d2Vfr+kfRMeXpLJF6A/i86n8JPF15Yyk8dvbyIDx6KAovx+1i7jQixQXO4UGsx7cYVtzUIjx2+KzE8PhRxR/Xw1DlhvELHkftKye1v5cYjvl4AldA0L5dsW2jU5+8fc7Cfrc9IDt6UmVXPIw38Bp+6y3grPIOd7Ly1nw2MlDa8rPi5lb5dSuq9QK5yTfLTp4pO3pS5ekNWK78b/2AU7UCj8IiPIyLKy8UN7UotKxRbNtYE2hXZa5ukps2R6ZxjPSwKyovHcc7WIrfewKuw/NYqDy6gl1/Ku3corStTXFTqzDfmQj0v5RtnizTOEbmujEy1/7b4otYhsUqRrwSeCA+xSwotKyV//pTwe4dvQ54LqUvv0q/W+6Ru3F2dOpL3I2/uwK/iUeDfe06316qtGPLeQXtqszVTfo/8lR0u7yFRzkDPAefK+SdeH6RYH9Hn4FWKj20wcDFL0mVW/5crIrm4SVwavWHFwwsBAf2yK/+MDpcQrlxNGNa0LFTftUHfcXWrfKfLxe0b4epmJDGPajphcj5VgXbnWnMgOLP3/cZUE86/SIcZqQxFoKOv/oMqCdVsI1NowGCM6uqC04VbA2pMAx34so+5KlFu9LK3yq29jVJFdqK+f8AemTWqyCLCkYAAAAASUVORK5CYII=`;
var b = Buffer.from(img.split("base64,")[1], "base64");
!(async () => {
  let image = await jimp.read(ss);
  console.log(image)
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
      console.log(result)
    result = result.scaleToFit(270, 270);
    result.writeAsync('test1.jpg')
    console.log(result.getBase64Async(jimp.MIME_PNG))
  }
  console.log(image)
  image.writeAsync("test1.png")
})();


