'use strict';

const construct = require('../construct');

const OrbitalSander_GSS12V13_O28 = {
  plug:
    construct.plug({
      outerDiameterA: 27.9,
      innerDiameterA: 24,
      distanceAB: 24,
      outerDiameterB: 27.8,
      heightRing: 5,
    }),
};

const OrbitalSander_GEX125150AVE_O28 = {
  plug:
    construct.plug({
      outerDiameterA: 27.4,
      innerDiameterA: 22.4,
      distanceAB: 33.5,
      outerDiameterB: 28.4,
      heightRing: 5,
    }),
};

const MiterSaw_GCM8SJL_I45 = {
  socket:
    construct.socket({
      outerDiameterA: 47,
      innerDiameterA: 46.5,
      distanceAB: 25,
      innerDiameterB: 45,
      heightRing: 5,
    }),
};

module.exports = {
  OrbitalSander_GSS12V13_O28,
  OrbitalSander_GEX125150AVE_O28,
  MiterSaw_GCM8SJL_I45,
};
