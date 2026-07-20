'use strict';

const PROPERTY_COMPONENTS = '_components';

// assigns the given components to the object
const assign = (object, components) => {
  object[PROPERTY_COMPONENTS] = { ...components };
  return object;
};

// returns the object's components, or {}
const components = (object) => {
  if (object && object.hasOwnProperty(PROPERTY_COMPONENTS)) {
    return object[PROPERTY_COMPONENTS];
  }
  return {};
}

// assigns the components; usage: components.assign(object, components)
components.assign = assign;

// returns the components; usage: components(object)
module.exports = components;
