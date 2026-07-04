'use strict';

const { cuboid, cylinder } = require('@jscad/modeling').primitives;
const { subtract, union, scission } = require('@jscad/modeling').booleans;
const { translate, align } = require('@jscad/modeling').transforms;

const measurements = require('../../../lib/measurements');
const arrays = require('../../../lib/arrays');

// creates a rectangular mounting plate with the given size and up to 4 mounting holes
const plateRectangular = (options, ...objects) => {
  objects = arrays.flatten(objects);
  const size = arrays.extend3(options.size ?? [100, 100, 5], null, 5);
  const radius = arrays.extendn(4, options.radius ?? 5);
  const distance = arrays.extendn(4, options.distance ?? 2);
  const distanceX = arrays.extendn(4, options.distanceX ?? distance);
  const distanceY = arrays.extendn(4, options.distanceY ?? distance);
  const segments = options.segments ?? 32;

  const plate = subtract(
    cuboid({ size: size }),
    !radius[0] ? undefined : translate([size[0] / 2 - radius[0] - distanceX[0], -size[1] / 2 + radius[0] + distanceY[0], 0], cylinder({ radius: radius[0], height: size[2], segments })),
    !radius[1] ? undefined : translate([size[0] / 2 - radius[1] - distanceX[1], size[1] / 2 - radius[1] - distanceY[1], 0], cylinder({ radius: radius[1], height: size[2], segments })),
    !radius[2] ? undefined : translate([-size[0] / 2 + radius[2] + distanceX[2], size[1] / 2 - radius[2] - distanceY[2], 0], cylinder({ radius: radius[2], height: size[2], segments })),
    !radius[3] ? undefined : translate([-size[0] / 2 + radius[3] + distanceX[3], -size[1] / 2 + radius[3] + distanceY[3], 0], cylinder({ radius: radius[3], height: size[2], segments }))
  );

  if (objects.length === 0) {
    return plate;
  }
  const objectsBottomCenter = measurements.pointInBoundingBox({ modes: ['center', 'center', 'min'] }, measurements.measureAggregateBoundingBox(objects));
  const alignedPlated = align({ relativeTo: objectsBottomCenter }, plate);

  const parts = scission(subtract(alignedPlated, objects));
  return parts[0];
}

const main = (params) => {
  return require('../../../lib/preview').invoke({ xRay: false, dimensions: true }, (params) => {
    const colorize = require('../../../lib/colorize');
    const grid = require('../../../lib/grid');
    const visuals = require('../../../lib/visuals');

    const objects = [];

    // plateRectangular
    {
      objects.push(align({}, plateRectangular({ size: 30, radius: 2, distance: 3, segments: 64 })));
    }
    {
      objects.push(align({}, plateRectangular({ size: [50, 80], radius: 3, distanceX: 3, distanceY: 4, segments: 64 })));
    }
    {
      const cylinders = align({ grouped: true },
        grid.distribute([4, null, null],
          subtract(cylinder({ radius: 10, height: 20, segments: 64 }), cylinder({ radius: 8, height: 20, segments: 64 })),
          subtract(cylinder({ radius: 10, height: 20, segments: 64 }), cylinder({ radius: 8, height: 20, segments: 64 }))
        )
      );
      objects.push(
        grid.distribute([null, 10, null],
          cylinders,
          [
            visuals.markAsVisual(colorize.transparent(union(cylinders)), visuals.TYPE_IMMATERIAL),
            plateRectangular({ size: 50, radius: 2, distance: 3, segments: 64 }, ...cylinders)
          ]
        )
      );
    }

    return grid.distribute([10, null, null], ...objects);
  });
}

module.exports = {
  main,
  plateRectangular,
};
