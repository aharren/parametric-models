'use strict';

const { cuboid, cylinder, cylinderElliptic } = require('@jscad/modeling').primitives;
const { union, subtract } = require('@jscad/modeling').booleans;
const { translate, rotateY, align } = require('@jscad/modeling').transforms;
const { hull } = require('@jscad/modeling').hulls;
const { degToRad } = require('@jscad/modeling').utils;

const grid = require('../../lib/grid');
const arrays = require('../../lib/arrays');
const preview = require('../../lib/preview');
const tubes = require('../../lib/tubes');

const main = (params) => {
  const wallThickness = 2;
  const segments = 256;

  const outerDiameter = 95;
  const innerDiameter = 80;

  const ringInnerDiameter = 65;
  const ringOuterDiameter = ringInnerDiameter + 2 * wallThickness;
  const rightCutsHeight = 20;
  const ringHeight1 = 50;
  const ringHeight2 = 60;
  const height = 28;

  const play = 0.4;

  const ring = (height) => {
    const rin1 = grid.center(tubes.tube({ height: height, innerRadius: ringInnerDiameter / 2, outerRadius: ringOuterDiameter / 2, segments }));
    const cro1 = grid.center(cuboid({ size: [2, ringOuterDiameter, rightCutsHeight] }))
    const cro2 = grid.center(cuboid({ size: [ringOuterDiameter, 2, rightCutsHeight] }))
    return grid.center(subtract(union(rin1), cro1, cro2));
  }

  const ring1 = ring(ringHeight1);
  const ring2 = ring(ringHeight2);

  const objects2 = [];
  const h = innerDiameter / 2 - ringOuterDiameter / 2;
  const h2 = 23;
  const l = 20;
  const cyl1 = cylinder({ height: height, radius: outerDiameter / 2, segments });
  const cyl2 = cylinder({ height: height - 2 * h - 2 * wallThickness, radius: innerDiameter / 2, segments });
  const cyl3 = translate([0, 0, -height / 2 + h / 2 + wallThickness], cylinderElliptic({ height: h, endRadius: arrays.extend2(innerDiameter / 2), startRadius: arrays.extend2(ringOuterDiameter / 2 + play), segments }));
  const cyl4 = translate([0, 0, +height / 2 - h / 2 - wallThickness], cylinderElliptic({ height: h, endRadius: arrays.extend2(ringOuterDiameter / 2 + play), startRadius: arrays.extend2(innerDiameter / 2), segments }));
  const rin2 = cylinder({ height: height, radius: ringOuterDiameter / 2 + play, segments });
  const box1 = align({ modes: ['min', 'center', 'center'] }, cuboid({ size: [outerDiameter / 2 + l, outerDiameter, height] }));
  const box2 = align({ modes: ['min', 'center', 'center'] }, cuboid({ size: [outerDiameter / 2 + l - wallThickness, innerDiameter, height - 2 * wallThickness - 2 * h] }));
  const box3 = rotateY(degToRad(5), align({ modes: ['min', 'center', 'center'] }, cuboid({ size: [outerDiameter / 2 + l + wallThickness * 2, innerDiameter, height - 2 * wallThickness - 2 * h] })));
  const box4 = translate([outerDiameter / 2 + l - wallThickness, 0, 0], align({ modes: ['min', 'center', 'center'] }, cuboid({ size: [wallThickness, outerDiameter, height] })));
  const box5 = translate([outerDiameter / 2 + l - wallThickness, 0, -3], align({ modes: ['min', 'center', 'center'] }, cuboid({ size: [wallThickness, innerDiameter, h2 - 2 * wallThickness] })));
  objects2.push(subtract(union(subtract(union(cyl1, box1), cyl2, rin2, box2, cyl3, cyl4, box3), box4), box5));

  const objects3 = [];
  const boxa4 = translate([0, 0, 0], align({ modes: ['min', 'center', 'center'] }, cuboid({ size: [wallThickness, outerDiameter, height] })));
  const boxa5 = translate([0 + 1, 0, -3], align({ modes: ['min', 'center', 'center'] }, cuboid({ size: [wallThickness, innerDiameter, h2 - 2 * wallThickness] })));
  const boxa6 = translate([0, 0, -3], align({ modes: ['min', 'center', 'center'] }, cuboid({ size: [wallThickness, innerDiameter, h2 - 2 * wallThickness] })));
  const cira1 = translate([50, 0, -25], align({ modes: ['min', 'center', 'center'] }, rotateY(degToRad(90), cylinder({ radius: 35 / 2, segments }))));
  const cira2 = translate([50 - 0, 0, -25], align({ modes: ['min', 'center', 'center'] }, rotateY(degToRad(90), cylinder({ radius: 35 / 2 - wallThickness, segments }))));
  const cira3 = translate([50, 0, -25], align({ modes: ['min', 'center', 'center'] }, rotateY(degToRad(90), cylinder({ radius: 35 / 2 - wallThickness, segments }))));
  const tube1 = translate([50, 0, -25], align({ modes: ['min', 'center', 'center'] }, rotateY(degToRad(90), tubes.tube({ height: 25, innerRadius: 31 / 2, outerRadius: 35 / 2, segments }))));

  objects3.push(subtract(union(hull(boxa4, cira1), tube1), hull(boxa5, cira2), boxa6, cira3));

  return grid.distribute([20, null, null],
    grid.distribute([null, 20, null], ring1, ring2),
    grid.distribute([5, null, null], ...grid.center(align({ modes: ['min', 'center', 'max'] }, objects2, objects3)))
  );
}

module.exports = { ...preview.main({ xRay: true, dimensions: true }, main) };
