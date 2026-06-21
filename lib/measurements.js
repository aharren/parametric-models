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

// returns the [x,y,z] distance between object1's and object2's center
const distance = (object1, object2) => {
  const boundingBox1 = measurements.measureAggregateBoundingBox(object1);
  const boundingBox2 = measurements.measureAggregateBoundingBox(object2);

  const center1 = pointInBoundingBox({ modes: ['center', 'center', 'center'] }, boundingBox1);
  const center2 = pointInBoundingBox({ modes: ['center', 'center', 'center'] }, boundingBox2);

  return [center2[0] - center1[0], center2[1] - center1[1], center2[2] - center1[2]]
}

module.exports = {
  measureBoundingBox: measurements.measureBoundingBox,
  measureAggregateBoundingBox: measurements.measureAggregateBoundingBox,
  measureDimensions: measurements.measureDimensions,
  measureAggregateDimensions,
  dimensionsFromBoundingBox,
  pointInBoundingBox,
  distance,
};
