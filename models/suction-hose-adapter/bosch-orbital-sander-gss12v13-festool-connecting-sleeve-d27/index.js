'use strict';

const { degToRad } = require('@jscad/modeling').utils;

const connectors = require('../../lib/suction-hose-connectors');

const config = {
  connector1: connectors.invert({ play: 0.0 }, connectors.library.bosch.OrbitalSander_GSS12V13_O28.plug),
  connector2: connectors.invert({ play: 0.0 }, connectors.library.festool.ConnectingSleeve_D27_O34_I27.plug),
  bendAngle: degToRad(40),
  wallThickness: 2,
  segments: 64,
};

module.exports = require('../../../lib/submodel').exports(require('../suction-hose-adapter'), config);
