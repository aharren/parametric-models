'use strict';

const { transforms } = require('@jscad/modeling');

const arrays = require('./arrays');
const measurements = require('./measurements');
const visuals = require('./visuals');

// put the object group's left front bottom corner at the given position
const at = (position, ...objects) => {
  return transforms.align({ modes: ['min', 'min', 'min'], relativeTo: position, grouped: true }, objects);
}

// center the object group on the x axis and y axis, and put it flat on the x-y surface, visuals are excluded from calculations
const center = (...objects) => {
  const [originalNonVisuals, originalVisuals] = visuals.detachVisuals(...arrays.flatten(objects));
  const alignedNonVisuals = transforms.align({ modes: ['center', 'center', 'min'], relativeTo: [0, 0, 0], grouped: true }, originalNonVisuals);
  const alignedVisuals = originalVisuals.length == 0 ? [] : transforms.translate(measurements.distance(originalNonVisuals, alignedNonVisuals), originalVisuals);
  return arrays.flattenAndUnpack1(alignedNonVisuals, alignedVisuals);
}

// center the object group on the x axis and y axis based on the first object, and put it flat on the x-y surface, visuals are excluded from calculations
const center1 = (...objects) => {
  const [originalNonVisuals, originalVisuals] = visuals.detachVisuals(...arrays.flatten(objects));
  const firstNonVisual = originalNonVisuals[0];
  const alignedFirstNonVisual = transforms.align({ modes: ['center', 'center', 'min'], relativeTo: [0, 0, 0], grouped: true }, firstNonVisual);
  const distance = measurements.distance(firstNonVisual, alignedFirstNonVisual);

  const alignedNonVisuals = transforms.translate(distance, originalNonVisuals);
  const alignedVisuals = originalVisuals.length == 0 ? [] : transforms.translate(distance, originalVisuals);
  return arrays.flattenAndUnpack1(alignedNonVisuals, alignedVisuals);
}

// distribute the given objects along the x, y, z axis with the given distance; use a null distance to ignore an axis
const distribute = (distances, ...objects) => {
  objects = arrays.unpack1(objects);
  const output = [];
  let nextMinX = distances[0] ?? null;
  let nextMinY = distances[1] ?? null;
  let nextMinZ = distances[2] ?? null;
  const distributeModes = [nextMinX !== null ? 'min' : 'none', nextMinY !== null ? 'min' : 'none', nextMinZ !== null ? 'min' : 'none'];
  objects.forEach(object => {
    output.push(transforms.align({ modes: distributeModes, relativeTo: [nextMinX, nextMinY, nextMinZ], grouped: true }, object));
    const dimensions = measurements.measureAggregateDimensions(object);
    nextMinX = nextMinX !== null ? nextMinX + dimensions[0] + distances[0] : null;
    nextMinY = nextMinY !== null ? nextMinY + dimensions[1] + distances[1] : null;
    nextMinZ = nextMinZ !== null ? nextMinZ + dimensions[2] + distances[2] : null;
  });
  const alignModes = [nextMinX !== null ? 'center' : 'none', nextMinY !== null ? 'center' : 'none', nextMinZ !== null ? 'center' : 'none'];
  return transforms.align({ modes: alignModes, relativeTo: [0, 0, 0], grouped: true }, output);
}

module.exports = {
  at,
  center,
  center1,
  distribute,
};
