'use strict';

const { sphere, cuboid } = require('@jscad/modeling').primitives;
const { union, subtract } = require('@jscad/modeling').booleans;
const { project } = require('@jscad/modeling').extrusions;
const { translate, rotateX } = require('@jscad/modeling').transforms;

const grid = require('../../lib/grid');
const config = require('../../lib/config');
const preview = require('../../lib/preview');
const { rasterizeX, rasterizeY, rasterizeZ } = require('../../lib/rasterize');

const main = (params) => {
  const { numLayers, layerHeight, connectorWidth, connectorPlay, segments } = config({
    params,
    defaults: {
      numLayers: 14,
      layerHeight: 3.25,
      connectorWidth: 10,
      connectorPlay: 0.1,
      segments: 64,
    },
  });

  const radius = (numLayers * layerHeight) / 2 + 0.5;

  // create a sphere, rasterize it via X, Y, Z axis, resulting in Z axis slices
  const slices = grid.center(
    rasterizeZ({ size: layerHeight },
      union(
        rasterizeY({ size: layerHeight },
          union(
            rasterizeX({ size: layerHeight },
              sphere({ radius, segments })
            )
          )
        )
      )
    )
  );

  // create a connector for the slices
  const connector = (play = 0) => {
    return grid.center(
      cuboid({ size: [layerHeight + play, layerHeight + play, layerHeight * numLayers] })
    );
  };

  const objects = [
    // for each slice, subtract the connector -- with some play
    ...slices.map((slice) => {
      return subtract(slice, connector(connectorPlay));
    }),
    // add the connector -- without play
    translate([radius * 3, 0, 0], grid.center(rotateX(Math.PI / 2, connector())))
  ];

  // also add the 2D projections
  objects.push(...project({}, objects));

  return objects;
}

module.exports = { ...preview.main({ xRay: true, dimensions: false }, main), ...config() };
