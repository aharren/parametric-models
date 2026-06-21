'use strict';

const { cube, polygon } = require('@jscad/modeling').primitives;
const { subtract } = require('@jscad/modeling').booleans;
const { extrudeLinear } = require('@jscad/modeling').extrusions;
const { rotate, align, translate } = require('@jscad/modeling').transforms;
const { degToRad } = require('@jscad/modeling/src').utils;

const measurements = require('./measurements');

// apply a miter cut at the top of the given objects, with the given x/y angles
const miterCutTop = (options, ...objects) => {
  const angles = options.angles ?? [0, 0];
  angles.map((angle, i) => {
    angles[i] = Math.max(Math.min(angle, Math.PI / 2.5), -Math.PI / 2.5);
  });

  const boundingBox = measurements.measureAggregateBoundingBox(objects);
  const dimensions = measurements.dimensionsFromBoundingBox(boundingBox);

  const moveX = angles[1] > 0 ? dimensions[0] / 2 : -dimensions[0] / 2;
  const moveY = angles[0] > 0 ? dimensions[1] / 2 : -dimensions[1] / 2;

  const cut = translate([boundingBox[1][0] - dimensions[0] / 2 + moveX, boundingBox[1][1] - dimensions[1] / 2 + moveY, boundingBox[1][2]],
    rotate([angles[0], -angles[1], 0],
      align({ modes: ['center', 'center', 'min'] },
        cube({ size: Math.max(...dimensions) * 3 })
      )
    )
  );

  const results = [];
  objects.forEach(object => {
    results.push(subtract(object, cut));
  });
  return results;
};

// apply a V cut for given objects, with the given width, depth, and angle
const vCutInternal = (options, ...objects) => {
  const width = options.width ?? 10;
  const depth = options.depth ?? 10;
  const angle = options.angle ?? 0;
  const rotateX = options.rotateX ?? -Math.PI / 2;
  const positionZ = options.positionZ ?? 'max';

  const boundingBox = measurements.measureAggregateBoundingBox(objects);
  const dimensions = measurements.dimensionsFromBoundingBox(boundingBox);

  const prism = (width, depth, height) => {
    return extrudeLinear({ height },
      polygon({ points: [[width / 2, 0], [0, depth], [-width / 2, 0]] })
    );
  }

  const z = positionZ === 'max' ? boundingBox[1][2] : boundingBox[0][2];
  const cut = translate([boundingBox[1][0] - dimensions[0] / 2, boundingBox[1][1] - dimensions[1] / 2, z],
    rotate([0, 0, angle],
      align({ modes: ['center', 'center', positionZ] },
        rotate([rotateX, 0, Math.PI / 2],
          align({ modes: ['min', 'min', 'center'] },
            prism(width, depth, Math.max(...dimensions) * 3)
          )
        )
      )
    )
  );

  const results = [];
  objects.forEach(object => {
    results.push(subtract(object, cut));
  });
  return results;
}

// apply a V cut at the top of the given objects, with the given width, depth, and angle
const vCutTop = (options, ...objects) => {
  const width = options.width ?? 10;
  const depth = options.depth ?? 10;
  const angle = options.angle ?? 0;

  const rotateX = -Math.PI / 2;
  const positionZ = 'max';
  return vCutInternal({ width, depth, angle, rotateX, positionZ }, objects);
}

// apply a V cut at the bottom of the given objects, with the given width, depth, and angle
const vCutBottom = (options, ...objects) => {
  const width = options.width ?? 10;
  const depth = options.depth ?? 10;
  const angle = options.angle ?? 0;

  const rotateX = Math.PI / 2;
  const positionZ = 'min';
  return vCutInternal({ width, depth, angle, rotateX, positionZ }, objects);
}

const main = (params) => {
  return require('./preview').invoke({ xRay: false, dimensions: true }, (params) => {
    const colorize = require('./colorize');
    const grid = require('./grid');

    const objects = [];

    // miterCutTop
    objects.push(grid.distribute([null, 20, null], [
      colorize.red(miterCutTop({ angles: [degToRad(10), 0] }, cube({ size: 40 }))),
      colorize.red(miterCutTop({ angles: [0, degToRad(10)] }, cube({ size: 40 }))),
      colorize.red(miterCutTop({ angles: [degToRad(10), degToRad(10)] }, cube({ size: 40 }))),
    ]));

    // vCutTop
    objects.push(grid.distribute([null, 20, null], [
      colorize.green(vCutTop({ width: 40, depth: 10 }, cube({ size: 40 }))),
      colorize.green(vCutTop({ width: 10, depth: 10, angle: Math.PI / 2 }, cube({ size: 40 }))),
      colorize.green(vCutTop({ width: 20, depth: 10, angle: Math.PI / 4 }, cube({ size: 40 }))),
    ]));

    // vCutBottom
    objects.push(grid.distribute([null, 20, null], [
      colorize.blue(vCutBottom({ width: 40, depth: 10 }, cube({ size: 40 }))),
      colorize.blue(vCutBottom({ width: 10, depth: 10, angle: Math.PI / 2 }, cube({ size: 40 }))),
      colorize.blue(vCutBottom({ width: 20, depth: 10, angle: Math.PI / 4 }, cube({ size: 40 }))),
    ]));

    return grid.distribute([30, null, null], objects);
  });
}

module.exports = {
  main,
  miterCutTop,
  vCutTop,
  vCutBottom,
};
