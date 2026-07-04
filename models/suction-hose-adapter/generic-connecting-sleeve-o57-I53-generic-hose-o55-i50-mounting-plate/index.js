'use strict';

const { degToRad } = require('@jscad/modeling').utils;
const { union } = require('@jscad/modeling').booleans;

const connectors = require('../../lib/suction-hose-connectors');
const mounts = require('../../lib/mounting-plates');

const config = {
  connector1: connectors.invert({ play: 0.0 }, connectors.library.generic.ConnectingSleeve_O57_I53.plug),
  connector2: connectors.invert({ play: 0.0 }, connectors.library.generic.Hose_O55_I50.socket),
  bendAngle: degToRad(0),
  wallThickness: 2,
  segments: 64,
};

config.connector1Modifier = (object) => {
  const plateWidth = config.connector1.outerDiameterA + config.wallThickness + 20;
  const holeDistance = 2 * config.wallThickness;
  const holeDiameter = 3;
  return union(object, mounts.plateRectangular({ size: plateWidth, distance: holeDistance, radius: holeDiameter / 2 }, object));
};

module.exports = require('../../../lib/submodel').exports(require('../suction-hose-adapter'), config);
