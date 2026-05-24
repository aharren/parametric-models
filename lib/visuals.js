'use strict';

const { primitives, booleans, transforms, measurements, geometries, extrusions, utils, hulls } = require('@jscad/modeling');
const { vectorText } = require('@jscad/modeling').text;

const arrays = require('./arrays');
const colorize = require('./colorize');
const grid = require('./grid');
const { runningInPreview, inPreviewOnly } = require('./internals/environment');

const lineThicknessThin = 0.1;

const visualColorAlphaMarker = 0.999;
const defaultVisualColor = [0, 0, 0];

// mark the given object as being a visual object
const markAsVisual = (object) => {
  if (!object.hasOwnProperty('color')) {
    object.color = defaultVisualColor;
  }
  object.color[3] = visualColorAlphaMarker;
  return object;
}

// returns true if the given object is a marked visual object
const isVisual = (object) => {
  if (!object.hasOwnProperty('color')) {
    return false;
  }
  if (!object.color.hasOwnProperty(3)) {
    return false;
  }
  return object.color[3] == visualColorAlphaMarker;
}

// cut the given object into halves and make one half transparent
const xRay = (options, obj) => {
  if (!runningInPreview) {
    // don't modify the object in non-preview
    return [obj];
  }

  if (!geometries.geom3.isA(obj)) {
    // only work on 3D geometries
    return [obj];
  }

  const objectCenter = measurements.measureCenter(obj);
  const objectDimensions = measurements.measureDimensions(obj);

  // create aligned bounding boxes for the halves
  const cut1 = transforms.align({ modes: ['center', 'max', 'center'], relativeTo: objectCenter }, primitives.cuboid({ size: [objectDimensions[0] + 1, objectDimensions[1] + 1, (objectDimensions[2] + 1) * 2] }));
  const cut2 = transforms.align({ modes: ['center', 'min', 'center'], relativeTo: objectCenter }, primitives.cuboid({ size: [objectDimensions[0] + 1, objectDimensions[1] + 1, (objectDimensions[2] + 1) * 2] }));

  // cut the original object
  const half1 = booleans.intersect(cut1, obj);
  const half2 = booleans.intersect(cut2, obj);

  // copy color
  if (obj.color) {
    half1.color = obj.color;
    half2.color = obj.color;
  }

  return [colorize.transparent(half1), half2];
}

// render the given text as a 3D object
const text = (options, txt) => {
  const height = options.height ?? 1.5;
  const center = options.center ?? [0, 0, 0];

  const segments = vectorText({ height }, String(txt));
  const corner = primitives.circle({ radius: lineThicknessThin })
  const geoms = segments.map(segment => {
    const corners = segment.map((point) => {
      return transforms.translate(point, corner);
    })
    return hulls.hullChain(corners);
  });
  const geoms3D = geoms.map(geom => {
    return extrusions.extrudeLinear({ height: lineThicknessThin }, geom);
  });
  const geom3D = booleans.union(geoms3D);
  return transforms.center({ axes: [true, true, false], relativeTo: center }, geom3D);
}

// render a 3D line with the given points
const line = (options, start, end) => {
  const height = options.height ?? lineThicknessThin;
  const size = options.size ?? lineThicknessThin;

  const geom = geometries.path2.fromPoints({}, [start ?? [0, 0], end ?? [0, 0]]);
  const line3D = extrusions.extrudeRectangular({ height, size }, geom);
  return line3D;
}

// create a length marker line |<---->|
const lengthMarkerLine = (options, length) => {
  const leftK = booleans.union(
    line({}, [-length / 2, 0], [-length / 2, -4]),
    line({}, [-length / 2, -2], [-length / 2 + 1, -1]),
    line({}, [-length / 2, -2], [-length / 2 + 1, -3])
  );
  const rightK = booleans.union(
    line({}, [length / 2, 0], [length / 2, -4]),
    line({}, [length / 2, -2], [length / 2 - 1, -1]),
    line({}, [length / 2, -2], [length / 2 - 1, -3])
  );
  const middle = line({}, [-length / 2, -2], [length / 2, -2]);

  return booleans.union(
    leftK,
    rightK,
    middle
  )
}

// create length marker guards |     |
const lengthMarkerGuards = (options, length) => {
  const left = booleans.union(
    line({}, [-length / 2, 0], [-length / 2, -4]),
  );
  const right = booleans.union(
    line({}, [length / 2, 0], [length / 2, -4]),
  );

  return booleans.union(
    left,
    right
  )
}

// create a length marker text
const lengthMarkerText = (options, length) => {
  const position = options.position ?? 'bottom';
  return text({ center: [0, position === 'bottom' ? -5 : 1, 0] }, Number.parseFloat(length).toFixed(2));
}

// create three length marker lines and texts for the dimensions of the given object
const dimensions = (options, obj) => {
  const modes = arrays.extendTo3D(options.modes ?? ['default']);
  const distance = arrays.extendTo2D(options.distance ?? 2);
  const dim = options.dimensions ?? measurements.measureDimensions(obj);
  const types = arrays.extendTo3D(options.types ?? 'full');
  const mirror = arrays.extendTo3D(options.mirror ?? [false]);
  const bounds = measurements.measureBoundingBox(obj);

  const constructMarkers = (size, type, position, mirror) => {
    const m = type === 'guards' ? lengthMarkerGuards({}, size) : booleans.union(lengthMarkerLine({}, size), lengthMarkerText({ position }, size));
    return mirror ? transforms.mirrorX(m) : m;
  }

  const objects = [];
  if (modes[0] !== 'none' && dim[0] > 0) {
    const markers = constructMarkers(dim[0], types[0], 'bottom', mirror[0]);
    switch (modes[0]) {
      case 'top':
        objects.push(transforms.align({ grouped: true, modes: ['center', 'max', 'max'], relativeTo: [(bounds[0][0] + bounds[1][0]) / 2, bounds[0][1] - distance[1], bounds[1][2]] }, markers));
        break;
      case 'bottom':
      case 'default':
      default:
        objects.push(transforms.align({ grouped: true, modes: ['center', 'max', 'max'], relativeTo: [(bounds[0][0] + bounds[1][0]) / 2, bounds[0][1] - distance[1], bounds[0][2]] }, markers));
        break;
    }
  }
  if (modes[1] !== 'none' && dim[1] > 0) {
    const markers = constructMarkers(dim[1], types[1], (modes[1] === 'right' ? 'top' : 'bottom'), mirror[1]);
    switch (modes[1]) {
      case 'right':
        objects.push(transforms.align({ grouped: true, modes: ['min', 'center', 'max'], relativeTo: [bounds[1][0] + distance[0], (bounds[0][1] + bounds[1][1]) / 2, bounds[0][2]] }, transforms.rotateZ(utils.degToRad(-90), markers)));
        break;
      case 'left':
      case 'default':
      default:
        objects.push(transforms.align({ grouped: true, modes: ['max', 'center', 'max'], relativeTo: [bounds[0][0] - distance[0], (bounds[0][1] + bounds[1][1]) / 2, bounds[0][2]] }, transforms.rotateZ(utils.degToRad(-90), markers)));
        break;
    }
  }
  if (modes[2] !== 'none' && dim[2] > 0) {
    const markers = constructMarkers(dim[2], types[2], 'bottom', mirror[2]);
    switch (modes[2]) {
      case 'right':
        objects.push(transforms.align({ grouped: true, modes: ['min', 'max', 'center'], relativeTo: [bounds[1][0] + distance[0], bounds[0][1] - distance[1], (bounds[0][2] + bounds[1][2]) / 2] }, transforms.rotate([0, utils.degToRad(90), utils.degToRad(45)], markers)));
        break;
      case 'left':
      case 'default':
      default:
        objects.push(transforms.align({ grouped: true, modes: ['max', 'max', 'center'], relativeTo: [bounds[0][0] - distance[0], bounds[0][1] - distance[1], (bounds[0][2] + bounds[1][2]) / 2] }, transforms.rotate([0, utils.degToRad(90), utils.degToRad(-45)], markers)));
        break;
    }
  }
  return markAsVisual(colorize.black(booleans.union(objects)));
}

const main = (params) => {
  const objects = grid.distribute([20, null, null], [
    colorize.red(transforms.align({}, primitives.cube({ size: 40 }))),
    colorize.green(transforms.align({}, primitives.cube({ size: 30 }))),
    colorize.blue(transforms.align({}, primitives.cube({ size: 20 }))),
    colorize.yellow(transforms.align({}, primitives.cube({ size: 20 }))),
  ]);

  const numObjects = objects.length;

  // add dimensions markers
  objects[numObjects + 0] = dimensions({}, objects[0]);
  objects[numObjects + 1] = dimensions({ modes: ['default', 'none'] }, objects[1]);
  objects[numObjects + 2] = dimensions({ modes: ['top', 'right', 'right'], mirror: [true, true, true] }, objects[2]);
  objects[numObjects + 3] = dimensions({ modes: ['bottom', 'right', 'right'], dimensions: [11, 12, 13], distance: 2 }, objects[3]);
  objects[numObjects + 4] = dimensions({ modes: ['bottom', 'right', 'right'], types: ['guards'], distance: 2 }, objects[3]);
  objects[numObjects + 5] = dimensions({ modes: ['bottom', 'right', 'right'], distance: [7.5, 10] }, objects[3]);

  // add x-ray
  objects[2] = xRay({}, objects[2]);

  // check for marked visual object
  objects.push(colorize.black(text({ center: [0, -45, 0] }, `${isVisual(objects[numObjects + 1])}, ${objects[numObjects + 1].color}`)));
  objects[numObjects + 1].color = isVisual(objects[numObjects + 1]) ? [0, 0.75, 0, 1] : [0.75, 0, 0, 1];

  return objects;
}

module.exports = {
  ...inPreviewOnly({ main }),
  line,
  text,
  xRay,
  dimensions,
  markAsVisual,
  isVisual,
};
