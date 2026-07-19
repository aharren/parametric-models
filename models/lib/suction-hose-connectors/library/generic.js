'use strict';

const construct = require('../construct');

const ConnectingSleeve_O57_I53 = {
  plug:
    construct.plug({
      outerDiameterA: 57,
      innerDiameterA: 53,
      distanceAB: 55,
      outerDiameterB: 59,
      heightRing: 25,
    }),
};

const ConnectingSleeve_O56_5 = {
  plug:
    construct.plug({
      outerDiameterA: 56.5,
      innerDiameterA: 52.5,
      distanceAB: 25,
      outerDiameterB: 57,
      heightRing: 10,
    }),
};

const Hose_O55_I50 = {
  socket:
    construct.socket({
      outerDiameterA: 55,
      innerDiameterA: 50,
      distanceAB: 55,
      innerDiameterB: 48,
      heightRing: 5,
    }),
};

const Hose_O40_I35 = {
  socket:
    construct.socket({
      outerDiameterA: 40,
      innerDiameterA: 35,
      distanceAB: 55,
      innerDiameterB: 33,
      heightRing: 5,
    }),
};

module.exports = {
  ConnectingSleeve_O57_I53,
  ConnectingSleeve_O56_5,
  Hose_O55_I50,
  Hose_O40_I35,
};
