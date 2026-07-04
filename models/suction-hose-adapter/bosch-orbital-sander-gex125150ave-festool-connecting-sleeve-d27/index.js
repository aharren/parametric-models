'use strict';

const { degToRad } = require('@jscad/modeling').utils;

const { vCutBottom } = require('../../../lib/cuts');

const connectors = require('../../lib/suction-hose-connectors');

const config = {
  connector1: connectors.invert({ play: 0.0 }, connectors.library.festool.ConnectingSleeve_D27_O34_I27.plug),
  connector2: connectors.invert({ play: 0.0 }, connectors.library.bosch.OrbitalSander_GEX125150AVE_O28.plug),
  connector2Modifier: (object) => {
    object = vCutBottom({ width: 15, depth: 6 }, object);
    object = vCutBottom({ width: 20, depth: 5.5 }, object);
    object = vCutBottom({ width: 26, depth: 4 }, object);
    return object;
  },
  bendAngle: degToRad(0),
  wallThickness: 2,
  segments: 64,
};

module.exports = require('../../../lib/submodel').exports(require('../suction-hose-adapter'), config);
