'use strict';

// running in preview if no process is defined or environment contains PREVIEW=ON
const runningInPreview = (typeof process == 'undefined') || (process && process.env && process.env['PREVIEW'] === 'ON');

// return the given object if running in preview
const inPreviewOnly = (object) => {
  if (typeof object === "function") {
    return runningInPreview ? object() : null;
  }
  return runningInPreview ? object : null;
};

module.exports = {
  runningInPreview,
  inPreviewOnly,
};
