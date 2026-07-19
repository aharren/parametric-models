'use strict';

const { rotate, translate, align, mirrorZ } = require('@jscad/modeling').transforms;
const { degToRad } = require('@jscad/modeling').utils;

const { tubeElliptic, tubeCurved } = require('../../lib/tubes');
const grid = require('../../lib/grid');
const config = require('../../lib/config');
const visuals = require('../../lib/visuals');
const preview = require('../../lib/preview');

const connectors = require('../lib/suction-hose-connectors');

const main = (params) => {
  const { connector1, connector1Modifier, connector2, connector2Modifier, bendAngle, wallThickness, segments } = config({
    params,
    //config: require('./bosch-orbital-sander-gss12v13-festool-connecting-sleeve-d27'),
    defaults: {
      connector1: connectors.invert({ play: 0.0 }, connectors.library.test.o57.plug),
      connector1Modifier: (object) => { return object; },
      connector2: connectors.invert({ play: 0.0 }, connectors.library.test.o50.socket),
      connector2Modifier: (object) => { return object; },
      bendAngle: degToRad(30),
      wallThickness: 2,
      segments: 64,
    }
  });

  const radius = (c) => {
    const r = {};
    r.outerRadiusA = c.isSocket ? c.innerDiameterA / 2 + wallThickness : c.outerDiameterA / 2;
    r.innerRadiusA = r.outerRadiusA - wallThickness;
    r.outerRadiusB = c.isSocket ? c.innerDiameterB / 2 + wallThickness : c.outerDiameterB / 2;
    r.innerRadiusB = r.outerRadiusB - wallThickness;
    r.outerRadiusRing = c.isSocket ? r.outerRadiusA : r.outerRadiusA + wallThickness;
    r.innerRadiusRing = c.isSocket ? r.innerRadiusA - wallThickness : r.innerRadiusA;
    r.distanceAB = c.distanceAB;
    r.heightRing = c.heightRing ?? 5;
    r.maxOuterRadius = Math.max(r.outerRadiusA, r.outerRadiusB, r.outerRadiusRing);
    return r;
  }
  const connector1Radius = radius(connector1);
  const connector2Radius = radius(connector2);

  const maxOuterRadius = Math.max(connector1Radius.maxOuterRadius, connector2Radius.maxOuterRadius);

  const bendOuterRadius = Math.min(connector1Radius.outerRadiusRing, connector2Radius.outerRadiusRing);
  const bendInnerRadius = Math.min(connector1Radius.innerRadiusRing, connector2Radius.innerRadiusRing);
  const bendCurveRadius = bendOuterRadius * 2;

  const dimensionStartDistance = 20;
  const dimensionDistance = 8;

  const segmentConnector = (c, mirror, modifier) => {
    const tube = {
      startOuterRadius: c.outerRadiusB,
      startInnerRadius: c.innerRadiusB,
      endOuterRadius: c.outerRadiusA,
      endInnerRadius: c.innerRadiusA,
      height: c.distanceAB,
    };

    const objects = [];
    objects.push(align({}, tubeElliptic({ ...tube, segments })));
    objects[0] = modifier(objects[0]);

    preview.only(() => {
      const distance = dimensionStartDistance + maxOuterRadius - c.maxOuterRadius;
      objects.push(visuals.dimensions({ modes: ['none', 'none', 'right'], distance: [2, distance + 2 * dimensionDistance], dimensions: [0, 0, tube.height], mirror: [false, false, !mirror] }, objects[0]));
      objects.push(visuals.dimensions({ modes: ['bottom', 'none', 'none'], distance: distance + 2 * dimensionDistance, dimensions: [tube.startOuterRadius * 2, 0, 0] }, objects[0]));
      objects.push(visuals.dimensions({ modes: ['bottom', 'none', 'none'], distance: distance + 1 * dimensionDistance, dimensions: [tube.startOuterRadius * 2, 0, 0], types: 'guards' }, objects[0]));
      objects.push(visuals.dimensions({ modes: ['bottom', 'none', 'none'], distance: distance + 1 * dimensionDistance, dimensions: [tube.startInnerRadius * 2, 0, 0] }, objects[0]));
      objects.push(visuals.dimensions({ modes: ['top', 'none', 'none'], distance: distance + 2 * dimensionDistance, dimensions: [tube.endOuterRadius * 2, 0, 0] }, objects[0]));
      objects.push(visuals.dimensions({ modes: ['top', 'none', 'none'], distance: distance + 1 * dimensionDistance, dimensions: [tube.endOuterRadius * 2, 0, 0], types: 'guards' }, objects[0]));
      objects.push(visuals.dimensions({ modes: ['top', 'none', 'none'], distance: distance + 1 * dimensionDistance, dimensions: [tube.endInnerRadius * 2, 0, 0] }, objects[0]));
    });
    return translate([0, 0, mirror ? tube.height : 0], mirror ? mirrorZ(objects) : objects);
  }

  const segmentRing = (c, mirror) => {
    const tube = {
      startOuterRadius: c.outerRadiusRing,
      startInnerRadius: c.innerRadiusRing,
      endOuterRadius: bendOuterRadius,
      endInnerRadius: bendInnerRadius,
      height: c.heightRing,
    };

    const objects = [];
    objects.push(align({}, tubeElliptic({ ...tube, segments })));

    preview.only(() => {
      const distance = dimensionStartDistance + maxOuterRadius - c.maxOuterRadius;
      objects.push(visuals.dimensions({ modes: ['bottom', 'none', 'none'], distance: distance + 0 * dimensionDistance, dimensions: [tube.startOuterRadius * 2, 0, 0], types: 'guards' }, objects[0]));
      objects.push(visuals.dimensions({ modes: ['bottom', 'none', 'none'], distance: distance + 0 * dimensionDistance, dimensions: [tube.startInnerRadius * 2, 0, 0] }, objects[0]));
      objects.push(visuals.dimensions({ modes: ['top', 'none', 'none'], distance: distance + 0 * dimensionDistance, dimensions: [tube.endInnerRadius * 2, 0, 0] }, objects[0]));
    });

    return translate([0, 0, mirror ? tube.height : 0], mirror ? mirrorZ(objects) : objects);
  }

  const segmentCurve = () => {
    const tube = {
      outerRadius: bendOuterRadius,
      innerRadius: bendInnerRadius,
      curveRadius: bendCurveRadius,
      angle: -bendAngle,
    };

    const objects = [];
    objects.push(tubeCurved({ ...tube, segments }));

    return objects;
  }

  const objects = [];
  objects.push(rotate([0, -bendAngle, 0], translate([-bendCurveRadius, 0, 0 - connector1Radius.distanceAB - connector1Radius.heightRing], segmentConnector(connector1Radius, false, connector1Modifier))));
  objects.push(rotate([0, -bendAngle, 0], translate([-bendCurveRadius, 0, 0 - connector1Radius.heightRing], segmentRing(connector1Radius, false))));
  if (bendAngle > 0) {
    objects.push(rotate([0, -bendAngle, 0], translate([-bendCurveRadius, 0, 0], segmentCurve())));
  }
  objects.push(translate([-bendCurveRadius, 0, 0], segmentRing(connector2Radius, true)));
  objects.push(translate([-bendCurveRadius, 0, connector2Radius.heightRing], segmentConnector(connector2Radius, true, connector2Modifier)));

  return grid.center1(rotate([0, bendAngle, 0], objects));
}

module.exports = { ...preview.main({ xRay: true, dimensions: false }, main), ...config(), };
