'use strict';

const construct = require('../construct');

const ConnectingSleeve_D27_O34_I27 = {
  plug:
    construct.plug({
      outerDiameterA: 34,
      innerDiameterA: 27,
      distanceAB: 30,
      outerDiameterB: 36,
      heightRing: 10,
    }),
}

module.exports = {
  ConnectingSleeve_D27_O34_I27,
};
