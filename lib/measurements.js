'use strict';

const measurements = require('@jscad/modeling').measurements;

const arrays = require('./arrays');

const dimensionsFromBoundingBox = (boundingBox) => {
  return [
    boundingBox[1][0] - boundingBox[0][0],
    boundingBox[1][1] - boundingBox[0][1],
    boundingBox[1][2] - boundingBox[0][2]
  ];
}

const measureAggregateDimensions = (...objects) => {
  const boundingBox = measurements.measureAggregateBoundingBox(...objects);
  return dimensionsFromBoundingBox(boundingBox);
}

const pointInBoundingBox = (options, boundingBox) => {
  const modes = arrays.extendTo3D(options.modes ?? 'center');

  const xyz = (dimension) => {
    switch (modes[dimension]) {
      case 'min':
        return boundingBox[0][dimension];
      case 'max':
        return boundingBox[1][dimension];
      case 'center':
      default:
        return (boundingBox[0][dimension] + boundingBox[1][dimension]) / 2;
    }
  };

  return [xyz(0), xyz(1), xyz(2)];
}

module.exports = {
  measureBoundingBox: measurements.measureBoundingBox,
  measureAggregateBoundingBox: measurements.measureAggregateBoundingBox,
  measureDimensions: measurements.measureDimensions,
  measureAggregateDimensions,
  dimensionsFromBoundingBox,
  pointInBoundingBox,
};
