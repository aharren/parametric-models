'use strict';

const { measureBoundingBox } = require('@jscad/modeling').measurements;
const { align, translate } = require('@jscad/modeling').transforms;
const { cuboid, cylinder } = require('@jscad/modeling').primitives;
const { subtract, union, intersect } = require('@jscad/modeling').booleans;
const { hull } = require('@jscad/modeling').hulls;
const { project } = require('@jscad/modeling').extrusions;

const splits = require('../../lib/splits');
const joints = require('../../lib/joints');
const grid = require('../../lib/grid');
const config = require('../../lib/config');
const preview = require('../../lib/preview');
const colorize = require('../../lib/colorize');
const visuals = require('../../lib/visuals');

const main = (params) => {
  const { width, depth, height, cornerRadius, space, frameBorder, segments, splitX, splitXPlay } = config({
    params,
    defaults: {
      width: 240,
      depth: 150,
      height: 15,
      cornerRadius: 15,
      space: (30 - 8) / 2, // e.g. (router copy ring diameter - router bit diameter) / 2
      frameBorder: 20,
      segments: 256,
      splitX: false,
      splitXPlay: 0,
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

  // create final frame
  const frameComponents = (() => {
    if (!splitX) {
      return [colorize.blue(frameMinusPlateWithSpace)];
    }

    // split it along the x axis
    const [part1, part2] = splits.splitX({}, frameMinusPlateWithSpace);
    const part1BoundingBox = measureBoundingBox(part1);

    // create dovetail joints for both sides
    const depth = 10;
    const size = [depth, Math.ceil(frameBorder * 3 / 5), height];
    const [plug1, socket1] = joints.dovetail({ size, play: splitXPlay, relativeTo: [part1BoundingBox[1][0], part1BoundingBox[1][1] - frameBorder / 2, part1BoundingBox[1][2] - height / 2] });
    const [plug2, socket2] = joints.dovetail({ size, play: splitXPlay, relativeTo: [part1BoundingBox[1][0], part1BoundingBox[0][1] + frameBorder / 2, part1BoundingBox[1][2] - height / 2] });

    // return parts with dovetail joints' plug and socket
    return [
      colorize.blue(union(part1, plug1, plug2)),
      colorize.red(translate([depth * 2, 0, 0], subtract(part2, socket1, socket2)))
    ];
  })();
  objects.push(...frameComponents);

  // also add the 2D projection it
  objects.push(project({}, frameComponents));

  return grid.center(objects);
}

module.exports = { ...preview.main({ xRay: false }, main), ...config() };
