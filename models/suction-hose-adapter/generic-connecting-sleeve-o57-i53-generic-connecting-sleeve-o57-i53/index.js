'use strict';

const { degToRad } = require('@jscad/modeling').utils;

const connectors = require('../../lib/suction-hose-connectors');

const config = {
  connector1: connectors.modify((object) => { object.heightRingA = 5; return object; }, connectors.invert({ play: 0.0 }, connectors.library.generic.ConnectingSleeve_O57_I53.plug)),
  connector2: connectors.modify((object) => { object.heightRingA = 5; return object; }, connectors.invert({ play: 0.0 }, connectors.library.generic.ConnectingSleeve_O57_I53.plug)),
  bendAngle: degToRad(0),
  wallThickness: 2,
  segments: 64,
};

module.exports = require('../../../lib/submodel').exports(require('../suction-hose-adapter'), config);
