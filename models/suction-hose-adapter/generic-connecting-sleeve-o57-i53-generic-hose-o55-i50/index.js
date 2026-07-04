'use strict';

const { degToRad } = require('@jscad/modeling').utils;

const connectors = require('../../lib/suction-hose-connectors');

const config = {
  connector1: connectors.invert({ play: 0.0 }, connectors.library.generic.ConnectingSleeve_O57_I53.plug),
  connector2: connectors.invert({ play: 0.0 }, connectors.library.generic.Hose_O55_I50.socket),
  bendAngle: degToRad(0),
  wallThickness: 2,
  segments: 64,
};

module.exports = require('../../../lib/submodel').exports(require('../suction-hose-adapter'), config);
