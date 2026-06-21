'use strict';

const { toArray } = require('@jscad/array-utils');

// flattens the given arrays/objects
const flatten = (...objects) => {
  const { flatten: flatten_ } = require('@jscad/array-utils');
  return flatten_(objects);
}

// returns the single contained object if the given object is a single element array
const unpack1 = (object) => {
  if (Array.isArray(object)) {
    if (object.length === 1) {
      return object[0];
    }
  }
  return object;
}

// flattens the given arrays/objects and unpacks a final single contained object
const flattenAndUnpack1 = (...objects) => {
  return unpack1(flatten(objects));
}

// extends the given value or array to a 2-dimensional array, copies the value to the element at position 1 if no explicit element1 is given
const extend2 = (value, element1 = undefined) => {
  const a = toArray(value);
  if (a.length < 2) {
    a[1] = element1 ?? a[0];
  }
  return a.slice(0, 2);
}

// extends the given value or array to a 3-dimensional array, copies the value to the element at position 1/2 if no explicit element1/2 is given
const extend3 = (value, element1 = undefined, element2 = undefined) => {
  const a = toArray(value);
  if (a.length < 2) {
    a[1] = element1 ?? a[0];
  }
  if (a.length < 3) {
    a[2] = element2 ?? a[1];
  }
  return a.slice(0, 3);
}

// splits the given array via the given filter function
const split = (array, fn) => {
  const splitInternal = (t, f, object) => {
    if (Array.isArray(object)) {
      const tt = [];
      const tf = [];
      object.forEach((object) => {
        splitInternal(tt, tf, object);
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
  splitInternal(t, f, array);
  return [...t, ...f];
}

const main = () => {
  const assert = require('assert');

  // extend2
  {
    const a = extend2(1);
    assert(a.length === 2 && a[0] === 1 && a[1] === 1);
  }
  {
    const a = extend2(1, 2);
    assert(a.length === 2 && a[0] === 1 && a[1] === 2);
  }
  {
    const a = extend2([1]);
    assert(a.length === 2 && a[0] === 1 && a[1] === 1);
  }
  {
    const a = extend2([1, 2, 3, 4]);
    assert(a.length === 2 && a[0] === 1 && a[1] === 2);
  }

  // extend3
  {
    const a = extend3(1);
    assert(a.length === 3 && a[0] === 1 && a[1] === 1 && a[2] === 1);
  }
  {
    const a = extend3(1, 2);
    assert(a.length === 3 && a[0] === 1 && a[1] === 2 && a[2] === 2);
  }
  {
    const a = extend3(1, 2, 3);
    assert(a.length === 3 && a[0] === 1 && a[1] === 2 && a[2] === 3);
  }
  {
    const a = extend3([1]);
    assert(a.length === 3 && a[0] === 1 && a[1] === 1 && a[2] === 1);
  }
  {
    const a = extend3([1, 2, 3, 4]);
    assert(a.length === 3 && a[0] === 1 && a[1] === 2 && a[2] === 3);
  }

  // split
  {
    const a = split([1, [2, 3, 4], 5, [6, 7, [8, 9, 10]]], (v) => v % 2 === 1);
    assert(a.length === 2 && JSON.stringify(a[0]) === '[1,[3],5,[7,[9]]]' && JSON.stringify(a[1]) === '[[2,4],[6,[8,10]]]');
  }

  // flatten
  {
    const a = flatten(1);
    assert(JSON.stringify(a) === '[1]');
  }
  {
    const a = flatten(1, 2);
    assert(JSON.stringify(a) === '[1,2]');
  }
  {
    const a = flatten([1]);
    assert(JSON.stringify(a) === '[1]');
  }
  {
    const a = flatten([1, [2, 3], [4, 5]]);
    assert(JSON.stringify(a) === '[1,2,3,4,5]');
  }

  // unpack1
  {
    const a = unpack1(1);
    assert(a === 1);
  }
  {
    const a = unpack1([1]);
    assert(a === 1);
  }
  {
    const a = unpack1([1, [2, 3], [4, 5]]);
    assert(JSON.stringify(a) === '[1,[2,3],[4,5]]');
  }

  // flattenAndUnpack1
  {
    const a = flattenAndUnpack1(1);
    assert(a === 1);
  }
  {
    const a = flattenAndUnpack1([1]);
    assert(a === 1);
  }
  {
    const a = flattenAndUnpack1([1, [2, 3], [4, 5]]);
    assert(JSON.stringify(a) === '[1,2,3,4,5]');
  }
}

module.exports = {
  main,
  toArray,
  flatten,
  unpack1,
  flattenAndUnpack1,
  extend2,
  extend3,
  split,
};
