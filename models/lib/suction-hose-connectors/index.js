'use strict';

const construct = require('./construct');
const library = require('./library');

module.exports = {
  construct: {
    plug: construct.plug,
    socket: construct.socket,
  },
  flip: construct.flip,
  invert: construct.invert,
  modify: construct.modify,
  library,
};
