'use strict';

const { cuboid, cylinder } = require('@jscad/modeling').primitives;
const { subtract } = require('@jscad/modeling').booleans;
const { hull } = require('@jscad/modeling').hulls;
const { project } = require('@jscad/modeling').extrusions;

const grid = require('../../lib/grid');
const config = require('../../lib/config');
const preview = require('../../lib/preview');
const colorize = require('../../lib/colorize');
const visuals = require('../../lib/visuals');

const main = (params) => {
  const { width, depth, height, cornerRadius, space, frameBorder, segments } = config({
    params,
    defaults: {
      width: 240,
      depth: 150,
      height: 15,
      cornerRadius: 15,
      space: (30 - 8) / 2, // e.g. (router copy ring diameter - router bit diameter) / 2
      frameBorder: 20,
      segments: 256,
    },
  });

  // build a plate with rounded corners
  const plate = (radius, offset) => {
    return hull(
      grid.at([offset, offset, 0], cylinder({ radius: radius, height: height, segments })),
      grid.at([offset + width - 2 * cornerRadius, offset, 0], cylinder({ radius: radius, height: height, segments })),
      grid.at([offset, offset + depth - 2 * cornerRadius, 0], cylinder({ radius: radius, height: height, segments })),
      grid.at([offset + width - 2 * cornerRadius, offset + depth - 2 * cornerRadius, 0], cylinder({ radius: radius, height: height, segments }))
    );
  }

  const objects = [];

  // in preview, show the original plate
  preview.only(() => {
    const originalPlate = colorize.transparent(plate(cornerRadius, space));
    objects.push(originalPlate);
  });

  // construct the frame, subtract the plate with addtional space
  const plateWithSpace = plate(cornerRadius + space, 0);
  const frame = grid.at([-frameBorder, -frameBorder, 0], cuboid({ size: [width + 2 * space + 2 * frameBorder, depth + 2 * space + 2 * frameBorder, height] }));
  const frameMinusPlateWithSpace = subtract(frame, plateWithSpace);
  objects.push(frameMinusPlateWithSpace);

  // also add the 2D projection it
  objects.push(project({}, frameMinusPlateWithSpace));

  return grid.center(objects);
}

module.exports = { ...preview.main({ xRay: false }, main), ...config() };
