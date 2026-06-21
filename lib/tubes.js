'use strict';

const { cylinderElliptic, ellipse } = require('@jscad/modeling').primitives;
const { subtract } = require('@jscad/modeling').booleans;
const { extrudeRotate } = require('@jscad/modeling').extrusions;
const { rotate, translate } = require('@jscad/modeling').transforms;
const { degToRad } = require('@jscad/modeling').utils;

const arrays = require('./arrays');

// construct an elliptic tube with given height, start/end outer/inner radius
const tubeElliptic = (options) => {
  const height = options.height ?? 10;
  const startOuterRadius = arrays.extend2(options.startOuterRadius ?? [10, 10]);
  const startInnerRadius = arrays.extend2(options.startInnerRadius ?? [8, 8]);
  const endOuterRadius = arrays.extend2(options.endOuterRadius ?? startOuterRadius);
  const endInnerRadius = arrays.extend2(options.endInnerRadius ?? startInnerRadius);
  const center = options.center ?? [0, 0, 0];
  const segments = options.segments ?? 32;

  const outer = cylinderElliptic({ height, startRadius: startOuterRadius, endRadius: endOuterRadius, center, segments });
  const inner = cylinderElliptic({ height, startRadius: startInnerRadius, endRadius: endInnerRadius, center, segments });
  return subtract(outer, inner);
};

// construct a tube with given height, outer/inner radius
const tube = (options) => {
  const height = options.height ?? 10;
  const outerRadius = options.outerRadius ?? 10;
  const innerRadius = options.innerRadius ?? 8;
  const center = options.center ?? [0, 0, 0];
  const segments = options.segments ?? 32;

  return tubeElliptic({ height, startOuterRadius: outerRadius, startInnerRadius: innerRadius, center, segments });
};

// construct an elliptic curved tube with given angle, outer/inner radius
const tubeCurvedElliptic = (options) => {
  const angle = options.angle ?? Math.PI / 2;
  const outerRadius = arrays.extend2(options.outerRadius ?? 10);
  const innerRadius = arrays.extend2(options.innerRadius ?? 8);
  const curveRadius = options.curveRadius ?? outerRadius[0] * 2;
  const center = options.center ?? [0, 0, 0];
  const segments = options.segments ?? 32;

  const ring = subtract(
    ellipse({ radius: outerRadius, center: [curveRadius, 0], segments }),
    ellipse({ radius: innerRadius, center: [curveRadius, 0], segments }),
  );
  const tube = rotate([Math.PI / 2, 0, angle < 0 ? Math.PI : 0], extrudeRotate({ angle: Math.abs(angle), segments }, ring));
  return translate([center[0] - (angle < 0 ? -curveRadius : curveRadius), center[1], center[2]], tube);
};

// construct a curved tube with given angle, outer/inner radius
const tubeCurved = (options) => {
  const angle = options.angle ?? Math.PI / 2;
  const outerRadius = options.outerRadius ?? 10;
  const innerRadius = options.innerRadius ?? 8;
  const curveRadius = options.curveRadius ?? outerRadius * 2;
  const center = options.center ?? [0, 0, 0];
  const segments = options.segments ?? 32;

  return tubeCurvedElliptic({ angle, outerRadius, innerRadius, curveRadius, center, segments });
}

const main = (params) => {
  return require('./preview').invoke({ xRay: false, dimensions: true }, (params) => {
    const colorize = require('./colorize');
    const grid = require('./grid');

    const objects = [];

    // tube
    objects.push(colorize.red(tube({ height: 50, outerRadius: 15, innerRadius: 12 })));

    // tubeElliptic
    objects.push(colorize.green(tubeElliptic({ height: 50, startOuterRadius: [10, 10], startInnerRadius: [9, 9], endOuterRadius: [20, 20], endInnerRadius: [19, 19] })));
    objects.push(colorize.blue(tubeElliptic({ height: 50, startOuterRadius: [20, 20], startInnerRadius: [8, 8], endOuterRadius: [10, 10], endInnerRadius: [8, 8] })));

    // tubeCurved
    objects.push(colorize.yellow(tubeCurved({ outerRadius: 15, innerRadius: 13, angle: degToRad(30), curveRadius: 40 })));

    // tubeCurvedElliptic
    objects.push(colorize.yellow(tubeCurvedElliptic({ outerRadius: [15, 12], innerRadius: [13, 10], angle: degToRad(-30) })));

    return grid.distribute([10, null, null], objects);
  });
}

module.exports = {
  main,
  tube,
  tubeElliptic,
  tubeCurved,
  tubeCurvedElliptic,
};
