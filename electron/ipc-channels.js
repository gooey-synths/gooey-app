// Channel names shared between the main process and the preload bridge. The
// renderer never sees these -- it only gets the narrow API that preload.js
// exposes over contextBridge.
const DEFINITIONS_CHANNEL = 'gooey:read-definitions';

module.exports = { DEFINITIONS_CHANNEL };
