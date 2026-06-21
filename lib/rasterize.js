'use strict';

const { sphere, cuboid } = require('@jscad/modeling').primitives;
const { union, intersect } = require('@jscad/modeling').booleans;
const { measureAggregateBoundingBox } = require('@jscad/modeling').measurements;
const { project, extrudeLinear } = require('@jscad/modeling').extrusions;
const { translate, rotateY, rotateX, align } = require('@jscad/modeling').transforms;

// rasterize the given objects (as a group) along the given axis (0 = X, 1 = Y, 2 = Z)
function rasterize(axis, options, ...objects) {
  const size = options.size ?? 5;
  const extract = Math.min(options.extract ?? 0.2, size);
  const extrude = Math.min(options.extrude ?? size, size);

  objects = align({ modes: ['center', 'center', 'center'], grouped: true }, objects);

  const boundingBox = measureAggregateBoundingBox(objects);
  const dimensions = [boundingBox[1][0] - boundingBox[0][0], boundingBox[1][1] - boundingBox[0][1], boundingBox[1][2] - boundingBox[0][2]];
  const numSlices = Math.floor(dimensions[axis] / size);
  const diff = dimensions[axis] - numSlices * size;

  const projectAxis = [0, 0, 0];
  projectAxis[axis] = 1;

  const orientSlice = [
    (slice) => rotateY(Math.PI / 2, slice),
    (slice) => rotateX(Math.PI / 2, slice),
    (slice) => slice,
  ];

  const slices = [];
  for (let i = 0, p = boundingBox[0][axis] + diff / 2; i < numSlices; i++, p += size) {
    const cuboidOffset = [0, 0, 0];
    cuboidOffset[axis] = p + size / 2 + extract / 2;
    const cuboidSize = [...dimensions];
    cuboidSize[axis] = extract;
    const sliceOffset = [0, 0, 0];
    sliceOffset[axis] = p;

    const slice2d = project({ axis: projectAxis },
      intersect(objects,
        translate(cuboidOffset,
          align({ modes: ['center', 'center', 'center'] },
            cuboid({ size: cuboidSize })
          )
        )
      )
    );
    slices.push(translate(sliceOffset, orientSlice[axis](extrudeLinear({ height: extrude }, slice2d))));
  }

  return align({ modes: ['center', 'center', 'center'], grouped: true }, slices);
}

// rasterize the given objects (as a group) along the X axis
function rasterizeX(options, ...objects) {
  return rasterize(0, options, objects);
}

// rasterize the given objects (as a group) along the Y axis
function rasterizeY(options, ...objects) {
  return rasterize(1, options, objects);
}

// rasterize the given objects (as a group) along the Z axis
function rasterizeZ(options, ...objects) {
  return rasterize(2, options, ...objects);
}

const main = (params) => {
  return require('./preview').invoke({ xRay: false, dimensions: true }, (params) => {
    const grid = require('./grid');

    const objects = [];

    // rasterizeX
    objects.push(union(rasterizeX({ size: 5 }, sphere({ radius: 50, segments: 64 }))));

    // rasterizeY
    objects.push(union(rasterizeY({ size: 5 }, sphere({ radius: 50, segments: 64 }))));

    // rasterizeZ
    objects.push(union(rasterizeZ({ size: 5 }, sphere({ radius: 50, segments: 64 }))));

    // rasterizeZ
    objects.push(union(rasterizeZ({ size: 5, extrude: 2.5 }, sphere({ radius: 50, segments: 64 }))));

    // rasterizeZ + rasterizeX + rasterize Y
    objects.push(union(rasterizeY({ size: 5 }, union(rasterizeX({ size: 5 }, union(rasterizeZ({ size: 5 }, sphere({ radius: 50, segments: 64 }))))))));

    return grid.distribute([50, null, null], objects);
  });
}

module.exports = {
  main,
  rasterizeX,
  rasterizeY,
  rasterizeZ,
};
