'use strict';

const { cube, cuboid } = require('@jscad/modeling').primitives;
const { subtract, intersect } = require('@jscad/modeling').booleans;
const { align } = require('@jscad/modeling').transforms;

const measurements = require('./measurements');
const colorize = require('./colorize');
const grid = require('./grid');
const preview = require('./preview');

const restrictRange = (min, max, value) => {
  return Math.max(min, Math.min(max, value));
}

const splitInternal = (options, ...objects) => {
  const percentages = [-0.1, 1.1];
  const boundingBox = options.boundingBox;
  const dimensions = options.dimensions;
  const sizeX = options.sizeX ?? [percentages[0] * dimensions[0], percentages[1] * dimensions[0]];
  const sizeY = options.sizeY ?? [percentages[0] * dimensions[1], percentages[1] * dimensions[1]];
  const sizeZ = options.sizeZ ?? [percentages[0] * dimensions[2], percentages[1] * dimensions[2]];

  // create the object for the split
  const relativeTo = [...boundingBox[0]];
  relativeTo[0] += sizeX[0];
  relativeTo[1] += sizeY[0];
  relativeTo[2] += sizeZ[0];
  const split = align({ modes: ['min', 'min', 'min'], relativeTo }, cuboid({ size: [sizeX[1] - sizeX[0], sizeY[1] - sizeY[0], sizeZ[1] - sizeZ[0]] }));

  // split the original object
  const part1 = intersect(objects, split);
  const part2 = subtract(objects, split);

  return [part1, part2];
}

// split the given objects (as a group) along the X axis (via percentage or absolute size)
const splitX = (options, ...objects) => {
  const percentage = options.percentage ?? 0.5;
  const boundingBox = measurements.measureAggregateBoundingBox(objects);
  const dimensions = measurements.dimensionsFromBoundingBox(boundingBox);
  const dimension = dimensions[0];
  const size = restrictRange(-dimension, dimension, options.size ?? percentage * dimension);

  const sizeX = size < 0 ? [dimension + size, dimension] : [0, size];
  return splitInternal({ sizeX, boundingBox, dimensions }, ...objects);
}

// split the given objects (as a group) along the Y axis (via percentage or absolute size)
const splitY = (options, ...objects) => {
  const percentage = options.percentage ?? 0.5;
  const boundingBox = measurements.measureAggregateBoundingBox(objects);
  const dimensions = measurements.dimensionsFromBoundingBox(boundingBox);
  const dimension = dimensions[1];
  const size = restrictRange(-dimension, dimension, options.size ?? percentage * dimension);

  const sizeY = size < 0 ? [dimension + size, dimension] : [0, size];
  return splitInternal({ sizeY, boundingBox, dimensions }, ...objects);
}

// split the given objects (as a group) along the Z axis (via percentage or absolute size)
const splitZ = (options, ...objects) => {
  const percentage = options.percentage ?? 0.5;
  const boundingBox = measurements.measureAggregateBoundingBox(objects);
  const dimensions = measurements.dimensionsFromBoundingBox(boundingBox);
  const dimension = dimensions[2];
  const size = restrictRange(-dimension, dimension, options.size ?? percentage * dimension);

  const sizeZ = size < 0 ? [dimension + size, dimension] : [0, size];
  return splitInternal({ sizeZ, boundingBox, dimensions }, ...objects);
}

const main = (params) => {
  const objects = [];

  const colorizeParts = (colorizeFn, objects) => {
    const [part1, part2] = objects;
    return [
      colorize.transparent(colorizeFn(part1)),
      colorizeFn(part2),
    ];
  }

  // splitX
  objects.push(grid.distribute([null, 20, null], [
    colorizeParts(colorize.red, splitX({ percentage: 0.25 }, cube({ size: 40 }))),
    colorizeParts(colorize.red, splitX({ percentage: -0.75 }, cube({ size: 40 }))),
    colorizeParts(colorize.red, splitX({ size: 5 }, cube({ size: 40 }))),
    colorizeParts(colorize.red, splitX({ size: -5 }, cube({ size: 40 }))),
  ]));

  // splitY
  objects.push(grid.distribute([null, 20, null], [
    colorizeParts(colorize.green, splitY({ percentage: 0.25 }, cube({ size: 40 }))),
    colorizeParts(colorize.green, splitY({ percentage: -0.75 }, cube({ size: 40 }))),
    colorizeParts(colorize.green, splitY({ size: 5 }, cube({ size: 40 }))),
    colorizeParts(colorize.green, splitY({ size: -5 }, cube({ size: 40 }))),
  ]));

  // splitZ
  objects.push(grid.distribute([null, 20, null], [
    colorizeParts(colorize.blue, splitZ({ percentage: 0.25 }, cube({ size: 40 }))),
    colorizeParts(colorize.blue, splitZ({ percentage: -0.75 }, cube({ size: 40 }))),
    colorizeParts(colorize.blue, splitZ({ size: 5 }, cube({ size: 40 }))),
    colorizeParts(colorize.blue, splitZ({ size: -5 }, cube({ size: 40 }))),
  ]));

  return grid.distribute([30, null, null], objects);
}

module.exports = {
  ...preview.only({ ...preview.main({ xRay: false, dimensions: true }, main) }),
  splitX,
  splitY,
  splitZ,
};
