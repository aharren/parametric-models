'use strict';

const { sphere, cuboid } = require('@jscad/modeling').primitives;
const { union, intersect } = require('@jscad/modeling').booleans;
const { measureAggregateBoundingBox } = require('@jscad/modeling').measurements;
const { project, extrudeLinear } = require('@jscad/modeling').extrusions;
const { translate, rotateY, align } = require('@jscad/modeling').transforms;

const grid = require('./grid');
const preview = require('./preview');

// rasterize the given objects (as a group) along the X axis
function rasterizeX(options, ...objects) {
  const size = options.size ?? 5;
  const extract = Math.min(options.extract ?? 0.2, size);
  const extrude = Math.min(options.extrude ?? size, size);

  objects = align({ modes: ['center', 'center', 'center'], grouped: true }, objects);

  const boundingBox = measureAggregateBoundingBox(objects);
  const dimensions = [boundingBox[1][0] - boundingBox[0][0], boundingBox[1][1] - boundingBox[0][1], boundingBox[1][2] - boundingBox[0][2]];
  const numSlices = Math.floor(dimensions[0] / size);
  const xDiff = dimensions[0] - numSlices * size;

  const slices = [];
  for (let i = 0, x = boundingBox[0][0] + xDiff / 2; i < numSlices; i++, x += size) {
    const slice2d = project({ axis: [1, 0, 0] },
      intersect(objects,
        translate([x + size / 2 + extract / 2, 0, 0],
          align({ modes: ['center', 'center', 'center'] },
            cuboid({ size: [extract, dimensions[1], dimensions[2]] })
          )
        )
      )
    );
    slices.push(translate([x, 0, 0], rotateY(Math.PI / 2, extrudeLinear({ height: extrude }, slice2d))));
  }

  return align({ modes: ['center', 'center', 'center'], grouped: true }, slices);
}

// rasterize the given objects (as a group) along the Z axis
function rasterizeZ(options, ...objects) {
  const size = options.size ?? 5;
  const extract = Math.min(options.extract ?? 0.2, size);
  const extrude = Math.min(options.extrude ?? size, size);

  objects = align({ modes: ['center', 'center', 'center'], grouped: true }, objects);

  const boundingBox = measureAggregateBoundingBox(objects);
  const dimensions = [boundingBox[1][0] - boundingBox[0][0], boundingBox[1][1] - boundingBox[0][1], boundingBox[1][2] - boundingBox[0][2]];
  const numSlices = Math.floor(dimensions[2] / size);
  const zDiff = dimensions[2] - numSlices * size;

  const slices = [];
  for (let i = 0, y = boundingBox[0][2] + zDiff / 2; i < numSlices; i++, y += size) {
    const slice2d = project({ axis: [0, 0, 1] },
      intersect(objects,
        translate([0, 0, y + size / 2 + extract / 2],
          align({ modes: ['center', 'center', 'center'] },
            cuboid({ size: [dimensions[0], dimensions[1], extract] })
          )
        )
      )
    );
    slices.push(translate([0, 0, y], extrudeLinear({ height: extrude }, slice2d)));
  }
  return align({ modes: ['center', 'center', 'center'], grouped: true }, slices);
}

const main = (params) => {
  const objects = [];

  // rasterizeX
  objects.push(union(rasterizeX({ size: 5 }, sphere({ radius: 50, segments: 64 }))));

  // rasterizeZ
  objects.push(union(rasterizeZ({ size: 5 }, sphere({ radius: 50, segments: 64 }))));

  // rasterizeZ
  objects.push(union(rasterizeZ({ size: 5, extrude: 2.5 }, sphere({ radius: 50, segments: 64 }))));

  // rasterizeZ + rasterizeX
  objects.push(union(rasterizeX({ size: 5 }, union(rasterizeZ({ size: 5 }, sphere({ radius: 50, segments: 64 }))))));

  return grid.distribute([50, null, null], objects);
}

module.exports = {
  ...preview.only({ ...preview.main({ xRay: false, dimensions: true }, main) }),
  rasterizeX,
  rasterizeZ,
};
