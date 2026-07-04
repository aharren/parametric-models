'use strict';

const { degToRad } = require('@jscad/modeling').utils;

const connectors = require('../../lib/suction-hose-connectors');

const config = {
  connector1: connectors.invert({ play: 0.0 }, connectors.library.generic.Hose_O55_I50.socket),
  connector2: connectors.invert({ play: 0.0 }, connectors.library.bosch.MiterSaw_GCM8SJL_I45.socket),
  bendAngle: degToRad(0),
  wallThickness: 2,
  segments: 64,
};

module.exports = require('../../../lib/submodel').exports(require('../suction-hose-adapter'), config);
