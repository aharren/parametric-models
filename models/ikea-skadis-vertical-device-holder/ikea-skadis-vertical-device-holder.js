'use strict';

const { cuboid } = require('@jscad/modeling').primitives;
const { union, subtract } = require('@jscad/modeling').booleans;
const { align } = require('@jscad/modeling').transforms;

const hooks = require('../lib/ikea-skadis-hooks');

const grid = require('../../lib/grid');
const config = require('../../lib/config');
const preview = require('../../lib/preview');

const main = (params) => {
  const { deviceHeight, deviceWidth, deviceDepthEnclosed, bottomBorderWidth, wallThickness, numBracketsX, numBracketsY, bracketWidth, bracketDepth, shellModifier } = config({
    params,
    //config: require('./apple-airport-express-gen2'),
    defaults: {
      deviceHeight: 22.5,
      deviceWidth: 98,
      deviceDepthEnclosed: 29,
      bottomBorderWidth: 13,

      wallThickness: 4,

      numBracketsX: 2,
      numBracketsY: 2,
      bracketWidth: 2,
      bracketDepth: 2,

      shellModifier: (object) => { return object; },
    }
  });

  const shellInnerSize = [deviceWidth + 2 * bracketDepth, deviceHeight + 2 * bracketDepth, deviceDepthEnclosed];
  const shellOuterSize = [shellInnerSize[0] + 2 * wallThickness, shellInnerSize[1] + 2 * wallThickness, shellInnerSize[2] + 1 * wallThickness];

  const shell = () => {
    const outside = grid.at([-wallThickness, -wallThickness, -wallThickness], cuboid({ size: shellOuterSize }));
    const inside = grid.at([0, 0, 0], cuboid({ size: shellInnerSize }));
    const bottomHole = grid.at([bottomBorderWidth + bracketDepth, 0, -wallThickness], cuboid({ size: [shellInnerSize[0] - 2 * bottomBorderWidth - 2 * bracketDepth, shellInnerSize[1], wallThickness] }));
    return subtract(outside, inside, bottomHole);
  };

  const innerBracketsX = () => {
    const bracketDistanceX = (shellInnerSize[0] - numBracketsX * bracketWidth) / (numBracketsX + 1);
    const bracket = cuboid({ size: [bracketWidth, bracketDepth, shellInnerSize[2] + wallThickness] });
    const objects = [];
    for (let i = 0; i < numBracketsX; i++) {
      const x = bracketDistanceX + i * (bracketWidth + bracketDistanceX);
      objects.push(grid.at([x, 0, -wallThickness], bracket));
      objects.push(grid.at([x, deviceHeight + bracketDepth, -wallThickness], bracket));
    }
    return union(objects);
  };

  const innerBracketsY = () => {
    const bracketDistanceY = (shellInnerSize[1] - numBracketsY * bracketWidth) / (numBracketsY + 1);
    const bracket = cuboid({ size: [bracketDepth, bracketWidth, shellInnerSize[2] + wallThickness] });
    const objects = [];
    for (let i = 0; i < numBracketsY; i++) {
      const y = bracketDistanceY + i * (bracketWidth + bracketDistanceY);
      objects.push(grid.at([0, y, -wallThickness], bracket));
      objects.push(grid.at([deviceWidth + bracketDepth, y, -wallThickness], bracket));
    }
    return union(objects);
  };

  const shellWithInnerBrackets = union(
    shell(),
    innerBracketsX(),
    innerBracketsY()
  );
  const model = union(
    align({ modes: ['center', 'max', 'max'] }, shellModifier(shellWithInnerBrackets)),
    align({ modes: ['center', 'min', 'max'] }, hooks.grid(shellOuterSize[0], shellOuterSize[2]))
  );
  return grid.center(model);
}

module.exports = { ...preview.main({ xRay: false }, main) };
