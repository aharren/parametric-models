'use strict';

const measurements = require('@jscad/modeling').measurements;

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

module.exports = {
  measureBoundingBox: measurements.measureBoundingBox,
  measureAggregateBoundingBox: measurements.measureAggregateBoundingBox,
  measureDimensions: measurements.measureDimensions,
  measureAggregateDimensions,
  dimensionsFromBoundingBox,
};
