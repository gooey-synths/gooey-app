import { NodeDefinition } from './node-definition';
import { loadDefinitions } from './node-definition';
import vco from './definitions/vco.json';
import envelope from './definitions/envelope.json';
import vca from './definitions/vca.json';

// Fallback for contexts with no filesystem access: unit tests and the browser
// under `ng serve`, where the Playwright suite runs. Electron replaces this at
// startup with whatever is in the definitions folder -- see
// NodeDefinitionService.load(), which is the only supported way to change the
// set of node types in the packaged app.
const files = [
  { file: 'vco.json', json: vco },
  { file: 'envelope.json', json: envelope },
  { file: 'vca.json', json: vca },
];

export const bundledDefinitions: NodeDefinition[] = loadDefinitions(files).definitions;
