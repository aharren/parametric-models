'use strict';

const { cuboid } = require('@jscad/modeling').primitives;
const { union } = require('@jscad/modeling').booleans;
const { align, rotateZ } = require('@jscad/modeling').transforms;
const { degToRad } = require('@jscad/modeling').utils;

const preview = require('../../lib/preview');

const main = (params) => {
  const side1 = { length: 15, width: 2 };
  const side2 = { length: 15, width: 4 };
  const side3 = { length: 15, width: 3 };
  const side4 = { length: 15, width: 5 };
  const height = 20;

  const object1 = align({ modes: ['min', 'center', 'min'] }, cuboid({ size: [side1.length, side1.width, height] }));
  const object2 = rotateZ(degToRad(90), align({ modes: ['min', 'center', 'min'] }, cuboid({ size: [side2.length, side2.width, height] })));
  const object3 = rotateZ(degToRad(180), align({ modes: ['min', 'center', 'min'] }, cuboid({ size: [side3.length, side3.width, height] })));
  const object4 = rotateZ(degToRad(270), align({ modes: ['min', 'center', 'min'] }, cuboid({ size: [side4.length, side4.width, height] })));

  const model = union(object1, object2, object3, object4);
  return align({}, model);
}

module.exports = { ...preview.main({ xRay: false }, main) };
