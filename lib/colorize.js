'use strict';

const { colors } = require('@jscad/modeling');

const arrays = require('./arrays');

// colorize the given objects with transparent color
const transparent = (...objects) => {
  const transparentObjects = arrays.flatten(objects).map((object) => {
    const color = object.color ?? [1, 1, 1, 1];
    return colors.colorize([color[0] * 0.3, color[1] * 0.3, color[2] * 0.3, color[3] * 0.5], object);
  });
  return arrays.unpack1(transparentObjects);
}

// colorize the given objects with the given color
const colorizer_fn = (color) => {
  if (typeof color === 'string') {
    color = colors.colorNameToRgb(color);
  }
  const fn = (...objects) => {
    return colors.colorize(color, objects);
  }
  return fn;
}

const colorizers = {
  black: colorizer_fn('black'),
  red: colorizer_fn('red'),
  green: colorizer_fn('green'),
  blue: colorizer_fn('blue'),
  yellow: colorizer_fn('yellow'),
  lightgray: colorizer_fn('lightgray'),
}

module.exports = {
  transparent,
  ...colorizers,
};
