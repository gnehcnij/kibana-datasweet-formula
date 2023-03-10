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
      const decoratedResponseFn = responseFn.apply(this, arguments);
      console.log('装饰一下开始');
      console.log(this.columns);
      console.log('装饰一下结束');
      return decoratedResponseFn;
    };
  }

  public start(core: CoreStart) {
    return {};
  }

  public stop() {}
}
