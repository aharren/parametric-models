'use strict';

const { cylinder } = require('@jscad/modeling').primitives;
const { subtract } = require('@jscad/modeling').booleans;
const { rotateX, align } = require('@jscad/modeling').transforms;

const measurements = require('../../../lib/measurements');

// Ubiquiti UK Ultra / Swiss Army Knife Access Point
const config = {
  deviceHeight: 33.2,
  deviceWidth: 84,
  deviceDepthEnclosed: 29,
  bottomBorderWidth: 20,

  wallThickness: 4,

  numBracketsX: 2,
  numBracketsY: 2,
  bracketWidth: 2,
  bracketDepth: 2,

  deviceDepthLed: 22,
  deviceLedHoleDiameter: 10,
};

config.shellModifier = (object) => {
  const boundingBox = measurements.measureBoundingBox(object);
  const frontBottom = measurements.pointInBoundingBox({ modes: ['center', 'min', 'min'] }, boundingBox);
  const ledHolePosition = [
    frontBottom[0],
    frontBottom[1],
    frontBottom[2] + config.wallThickness + config.deviceDepthLed
  ]
  const ledHole = align({ modes: ['center', 'min', 'center'], relativeTo: ledHolePosition },
    rotateX(Math.PI / 2,
      cylinder({ height: config.wallThickness + config.bracketDepth, radius: config.deviceLedHoleDiameter / 2, segments: 256 })
    )
  );
  return subtract(object, ledHole);
};

module.exports = require('../../../lib/submodel').exports(require('../ikea-skadis-vertical-device-holder'), config);
