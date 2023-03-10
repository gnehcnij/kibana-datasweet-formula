// @ts-ignore
import { PluginInitializerContext } from 'kibana/public';
import { DatasweetFormulaPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin(initializerContext: PluginInitializerContext) {
  return new DatasweetFormulaPlugin(initializerContext);
}

export { DatasweetFormulaPluginStart } from './types';
