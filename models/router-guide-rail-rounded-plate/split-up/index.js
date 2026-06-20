'use strict';

const config = {
  width: 240,
  depth: 150,
  height: 15,
  cornerRadius: 15,
  space: (30 - 8) / 2, // e.g. (router copy ring diameter - router bit diameter) / 2
  frameBorder: 20,
  segments: 256,
  splitX: true,
  splitXPlay: 0,
};

module.exports = require('../../../lib/submodel').exports(require('../router-guide-rail-rounded-plate'), config);
