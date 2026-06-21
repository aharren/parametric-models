'use strict';

const { toArray, flatten } = require('@jscad/array-utils');

const unpackSingleElementArray = (object) => {
  if (Array.isArray(object)) {
    if (object.length === 1) {
      return object[0];
    }
  }
  return object;
}

const flattenAndUnpackSingleElementArray = (...arrays) => {
  return unpackSingleElementArray(flatten(arrays));
}

const extendTo2D = (value) => {
  const a = toArray(value);
  if (a.length < 2) {
    a[1] = a[0];
  }
  return a;
}

const extendTo3D = (value) => {
  const a = toArray(value);
  if (a.length < 2) {
    a[1] = a[0];
  }
  if (a.length < 3) {
    a[2] = a[1];
  }
  return a;
}

const filterDeep = (objects, fn) => {
  const split = (t, f, object) => {
    if (Array.isArray(object)) {
      const tt = [];
      const tf = [];
      object.forEach((object) => {
        split(tt, tf, object);
      });
      t.push(tt);
      f.push(tf);
    } else {
      if (fn(object)) {
        t.push(object);
      } else {
        f.push(object);
      }
    }
  }
  const t = [];
  const f = [];
  split(t, f, objects);
  return [...t, ...f];
}

module.exports = {
  toArray,
  flatten,
  unpackSingleElementArray,
  flattenAndUnpackSingleElementArray,
  extendTo2D,
  extendTo3D,
  filterDeep,
};
