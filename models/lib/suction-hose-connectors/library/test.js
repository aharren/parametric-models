'use strict';

const construct = require('../construct');

const o30i25 = {
  plug:
    construct.plug({
      outerDiameterA: 30,
      innerDiameterA: 26,
      distanceAB: 31,
      outerDiameterB: 32,
      heightRing: 10,
    }),
  socket:
    construct.socket({
      outerDiameterA: 28,
      innerDiameterA: 25,
      distanceAB: 26,
      innerDiameterB: 23,
      heightRing: 5,
    }),
};

const o57 = {
  plug:
    construct.plug({
      outerDiameterA: 57,
      innerDiameterA: 53,
      distanceAB: 55,
      outerDiameterB: 59,
      heightRing: 25,
    }),
};

const o50 = {
  socket:
    construct.socket({
      outerDiameterA: 55,
      innerDiameterA: 50,
      distanceAB: 55,
      innerDiameterB: 48,
      heightRing: 5,
    }),
};

module.exports = {
  o30i25,
  o57,
  o50,
};
