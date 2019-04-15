"use strict";

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }

  io: {
    enable: true,
    package: "egg-socket.io"
  },
  mongoose: {
    enable: true,
    package: "egg-mongoose"
  },
  nunjucks:{
    enable: true,
    package: 'egg-view-nunjucks',
  }
};
