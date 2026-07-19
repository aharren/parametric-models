'use strict';

const defaultHeightRing = 10;

const TYPE_PLUG = 'plug';
const TYPE_SOCKET = 'socket';

const type = (t) => {
  return {
    type: t,
    isPlug: t === TYPE_PLUG,
    isSocket: t === TYPE_SOCKET,
  }
}

const param = (params, name) => {
  const value = (params.hasOwnProperty(name) ? params[name] : null) ?? null;
  if (value === null) {
    throw Error(`parameter '${name}' required`);
  }
  return {
    [name]: value
  };
}

// constructs a plug connector with the given diameters; end A is at the outer, open end
const plug = (params) => {
  const object = {
    ...type(TYPE_PLUG),
    ...param(params, 'outerDiameterA'),
    ...param(params, 'innerDiameterA'),
    ...param(params, 'distanceAB'),
    ...param(params, 'outerDiameterB'),
    heightRing: params.heightRing ?? defaultHeightRing,
  };
  object.wallThickness = Math.abs(object.outerDiameterA - object.innerDiameterA);
  object.innerDiameterB = object.outerDiameterB - object.wallThickness;
  return object;
}

// constructs a socket connector with the given diameters; end A is at the outer, open end
const socket = (params) => {
  const object = {
    ...type(TYPE_SOCKET),
    ...param(params, 'outerDiameterA'),
    ...param(params, 'innerDiameterA'),
    ...param(params, 'distanceAB'),
    ...param(params, 'innerDiameterB'),
    heightRing: params.heightRing ?? defaultHeightRing,
  };
  object.wallThickness = Math.abs(object.outerDiameterA - object.innerDiameterA);
  object.outerDiameterB = object.innerDiameterB + object.wallThickness;
  return object;
}

// inverts the given connector, e.g. creates a socket connector from a plug connector
const invert = (options, object) => {
  const play = options.play ?? 0;

  switch (object.type) {
    case TYPE_PLUG:
      return socket({
        outerDiameterA: object.outerDiameterA + object.wallThickness + play,
        innerDiameterA: object.outerDiameterA + play,
        distanceAB: object.distanceAB,
        innerDiameterB: object.outerDiameterB + play,
        heightRing: object.heightRing,
      });
    case TYPE_SOCKET:
      return plug({
        outerDiameterA: object.innerDiameterA - play,
        innerDiameterA: object.innerDiameterA - object.wallThickness - play,
        distanceAB: object.distanceAB,
        outerDiameterB: object.innerDiameterB - play,
        heightRing: object.heightRing,
      });
    default:
      return {};
  }
}

// applies the given modification function to the given connector object
const modify = (fn, object) => {
  return fn(object);
}

module.exports = {
  plug,
  socket,
  invert,
  modify,
};
