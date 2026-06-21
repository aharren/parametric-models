'use strict';

const { extrudeLinear } = require('@jscad/modeling').extrusions;
const { cuboid, polygon } = require('@jscad/modeling').primitives;
const { union, subtract } = require('@jscad/modeling').booleans;
const { align, translate, rotateY } = require('@jscad/modeling').transforms;
const { degToRad } = require('@jscad/modeling').utils;

const arrays = require('./arrays');
const preview = require('./preview');

// create a dovetail joint with the given size, angle, and play, aligned [min, center, center] relative to the given position; returns [plug, socket]
const dovetail = (options) => {
  const size = arrays.extend3(options.size ?? [10, 20, 5]);
  const angle = options.angle ?? degToRad(20);
  const play = arrays.extend3(options.play ?? 0);
  const relativeTo = arrays.extend3(options.relativeTo ?? 0);

  const prism = (play = 0) => {
    const [x, y, z] = size;
    const [playX, playY, playZ] = arrays.extend3(play);
    const flare = Math.tan(angle) * x;
    return extrudeLinear({ height: z + 2 * playZ },
      polygon({
        points: [
          [x + playX, y + playY],
          [0, y - flare + playY],
          [0, flare - playY],
          [x + playX, -playY]
        ]
      })
    );
  };

  const plug = align({ modes: ['min', 'center', 'center'] }, prism());
  const socket = align({ modes: ['min', 'center', 'center'] }, prism(play));

  return align({ modes: ['min', 'center', 'center'], relativeTo, grouped: true }, [plug, socket]);
}

const main = (params) => {
  const colorize = require('./colorize');
  const grid = require('./grid');

  const objects = [];

  const combineWithFlatParts = (colorizeFn, joint) => {
    const [plug, socket] = joint;
    const part1 = align({ modes: ['max', 'center', 'min'] }, cuboid({ size: [30, 30, 5] }));
    const part2 = align({ modes: ['min', 'center', 'min'] }, cuboid({ size: [30, 30, 5] }));
    return [
      colorizeFn(union(part1, plug)),
      colorize.transparent(colorizeFn(subtract(part2, socket)))
    ];
  };

  const combineWithSquareParts = (colorizeFn, joint) => {
    const [plug, socket] = joint;
    const part1 = align({ modes: ['max', 'center', 'min'] }, cuboid({ size: [30, 30, 5] }));
    const part2 = align({ modes: ['min', 'center', 'min'] }, rotateY(Math.PI / 2, cuboid({ size: [35, 30, 5] })));
    return [
      colorizeFn(union(part1, plug)),
      colorize.transparent(colorizeFn(subtract(part2, socket)))
    ];
  };

  // dovetail flat
  objects.push(combineWithFlatParts(colorize.red, dovetail({ size: [5, 15, 5], angle: degToRad(15), relativeTo: [0, 0, 2.5] })));
  objects.push(combineWithFlatParts(colorize.red, dovetail({ size: [10, 10, 5], angle: degToRad(10), relativeTo: [0, 0, 2.5], play: 1 })));

  // dovetail square
  objects.push(combineWithSquareParts(colorize.red, dovetail({ size: [5, 15, 5], angle: degToRad(15), relativeTo: [0, 0, 2.5], play: 1 })));

  return grid.distribute([null, 30, null], objects);
}

module.exports = {
  ...preview.only({ ...preview.main({ xRay: false, dimensions: true }, main) }),
  dovetail,
};
