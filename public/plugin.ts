// @ts-ignore
import { CoreSetup, CoreStart, Plugin, PluginInitializerContext } from 'kibana/public';
import { DatasweetFormulaPluginStart } from './types';
import { getDatasweetFormulaMetricAgg } from './agg_types/datasweet_formula';

// @ts-ignore
import { DataPublicPlugin } from '../../../src/plugins/data/public/plugin';
import { datasweetFormula } from './agg_types/datasweet_formula_fn';
// @ts-ignore
import { ExpressionsPublicPlugin } from '../../../src/plugins/expressions/public';
import { TabbedAggResponseWriter } from '../../../src/plugins/data/common';

import { applyFormula } from './decorators/lib/apply_formula';
import { applyHiddenCols } from './decorators/lib/apply_hidden_cols';

export interface DatasweetFormulaPluginSetupDependencies {
  data: ReturnType<DataPublicPlugin['setup']>;
  expressions: ReturnType<ExpressionsPublicPlugin['setup']>;
}

export class DatasweetFormulaPlugin implements Plugin<void, DatasweetFormulaPluginStart> {
  initializerContext: PluginInitializerContext;

  constructor(initializerContext: PluginInitializerContext) {
    this.initializerContext = initializerContext;
  }

  public setup(core: CoreSetup, { data, expressions }: DatasweetFormulaPluginSetupDependencies) {
    data.search.aggs.types.registerMetric('datasweet_formula', getDatasweetFormulaMetricAgg);
    expressions.registerFunction(datasweetFormula);
    const responseFn = TabbedAggResponseWriter.prototype.response;
    TabbedAggResponseWriter.prototype.response = function () {
      // @ts-ignore
      // eslint-disable-next-line prefer-rest-params
      const decoratedResponse = responseFn.apply(this, arguments);
      applyFormula(this.columns, decoratedResponse);
      applyHiddenCols(this.columns, decoratedResponse);
      return decoratedResponse;
    };
  }

  public start(core: CoreStart) {
    return {};
  }

  public stop() {}
}
