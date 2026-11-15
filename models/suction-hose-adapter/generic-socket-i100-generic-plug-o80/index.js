'use strict';

const { degToRad } = require('@jscad/modeling').utils;

const connectors = require('../../lib/suction-hose-connectors');

const config = {
  connector1: connectors.construct.socket({ outerDiameterA: 104, innerDiameterA: 102, distanceAB: 50, innerDiameterB: 100, heightRing: 30, ringStop: false }),
  connector2: connectors.construct.plug({ outerDiameterA: 78, innerDiameterA: 76, distanceAB: 50, outerDiameterB: 80 }),
  bendAngle: degToRad(0),
  wallThickness: 3,
  segments: 256,
};

module.exports = require('../../../lib/submodel').exports(require('../suction-hose-adapter'), config);
