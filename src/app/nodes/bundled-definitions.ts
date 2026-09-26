import { NodeDefinition, loadDefinitions } from './node-definition';
import fastAnalogIn from '../../../definitions/fast_analog_in.json';
import fastAnalogOut from '../../../definitions/fast_analog_out.json';
import fastDigitalIn from '../../../definitions/fast_digital_in.json';
import fastDigitalOut from '../../../definitions/fast_digital_out.json';

// Fallback for contexts with no filesystem access: unit tests and the browser
// under `ng serve`, where the Playwright suite runs. Electron replaces this at
// startup with whatever is in the definitions folder -- see
// NodeDefinitionService.load(), which is the only supported way to change the
// set of node types in the packaged app.
const files = [
  { file: 'fast_analog_in.json', json: fastAnalogIn },
  { file: 'fast_analog_out.json', json: fastAnalogOut },
  { file: 'fast_digital_in.json', json: fastDigitalIn },
  { file: 'fast_digital_out.json', json: fastDigitalOut },
];

export const bundledDefinitions: NodeDefinition[] = loadDefinitions(files).definitions;
