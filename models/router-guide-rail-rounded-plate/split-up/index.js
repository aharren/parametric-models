'use strict';

const config = {
  width: 300,
  depth: 45,
  height: 15,
  cornerRadius: 1,
  space: (30 - 8) / 2, // e.g. (router copy ring diameter - router bit diameter) / 2
  frameBorder: 20,
  segments: 256,
  splitX: true,
  splitXPlay: 0,
};

module.exports = require('../../../lib/submodel').exports(require('../router-guide-rail-rounded-plate'), config);
