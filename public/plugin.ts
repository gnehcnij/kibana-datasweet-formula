// @ts-ignore
import { CoreSetup, CoreStart, Plugin, PluginInitializerContext } from 'kibana/public';
import { DatasweetFormulaPluginStart } from './types';
import { getDatasweetFormulaMetricAgg } from './agg_types/datasweet_formula';

// @ts-ignore
import { DataPublicPlugin } from '../../../src/plugins/data/public/plugin';
import { datasweetFormula } from './agg_types/datasweet_formula_fn';
// @ts-ignore
import { ExpressionsPublicPlugin } from '../../../src/plugins/expressions/public';
import { decorateTabbedAggResponseWriter } from './decorators/response_writer';
// @ts-ignore
import { FieldFormatsPlugin } from '../../../src/plugins/field_formats/public/plugin';

export interface DatasweetFormulaPluginSetupDependencies {
  data: ReturnType<DataPublicPlugin['setup']>;
  expressions: ReturnType<ExpressionsPublicPlugin['setup']>;
  fieldFormats: ReturnType<FieldFormatsPlugin['setup']>;
}

export class DatasweetFormulaPlugin implements Plugin<void, DatasweetFormulaPluginStart> {
  initializerContext: PluginInitializerContext;

  constructor(initializerContext: PluginInitializerContext) {
    this.initializerContext = initializerContext;
  }

  public setup(
    core: CoreSetup,
    { data, expressions, fieldFormats }: DatasweetFormulaPluginSetupDependencies
  ) {
    data.search.aggs.types.registerMetric('datasweet_formula', getDatasweetFormulaMetricAgg);
    expressions.registerFunction(datasweetFormula);
    // @ts-ignore
    decorateTabbedAggResponseWriter(fieldFormats);
  }

  public start(core: CoreStart) {
    return {};
  }

  public stop() {}
}
