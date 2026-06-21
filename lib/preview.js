'use strict';

const { runningInPreview, inPreviewOnly } = require('./internals/environment');

// apply visual effects like x-ray in preview
// usage: module.exports = { ...preview.main( {}, main) };
//        module.exports = { ...preview.main( { xRay: false, ... }, main) };
const main = (settings, main) => {
  const { geometries } = require('@jscad/modeling');
  const { extrudeLinear } = require('@jscad/modeling').extrusions;
  const { translate } = require('@jscad/modeling').transforms;

  const arrays = require('./arrays');
  const colorize = require('./colorize');
  const measurements = require('./measurements');
  const { xRay, dimensions, isVisual } = require('./visuals');

  const fn = (params) => {
    // create objects via real main
    let originalObjects = arrays.toArray(main(params));

    // if not running in preview, just return the original objects
    if (!runningInPreview) {
      return originalObjects;
    }

    let objects = [...originalObjects];

    // apply x-ray to all objects
    if (settings.xRay ?? true) {
      objects = (() => {
        const objectsWithXRay = [];
        objects.forEach(object => {
          if (!geometries.geom3.isA(object)) {
            objectsWithXRay.push(object);
            return;
          }
          if (isVisual(object)) {
            objectsWithXRay.push(object);
            return;
          }
          objectsWithXRay.push(...xRay({}, object));
        });
        return objectsWithXRay;
      })();
    }

    // make 2D geometries visible
    {
      const boundingBox = measurements.measureAggregateBoundingBox(originalObjects);
      let offset = boundingBox[0][2] - 10;
      originalObjects.forEach(object => {
        if (!geometries.geom2.isA(object)) {
          return;
        }
        offset -= 2;
        objects.push(colorize.lightgray(translate([0, 0, offset], extrudeLinear({ height: 0.1 }, object))));
      });
    }

    // add dimensions markers
    if (settings.dimensions ?? true) {
      originalObjects.forEach(object => {
        if (!geometries.geom3.isA(object)) {
          return;
        }
        objects.push(dimensions({}, object));
      });
    }

    return objects;
  }

  return {
    main: fn
  };
}

const invoke = (settings, fn) => {
  return main(settings, fn).main();
}

module.exports = {
  main,
  invoke,
  only: inPreviewOnly,
};
