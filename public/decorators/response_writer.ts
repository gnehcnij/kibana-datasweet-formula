import { TabbedAggResponseWriter } from '../../../../src/plugins/data/common';
import { applyFormula } from './lib/apply_formula';
import { applyHiddenCols } from './lib/apply_hidden_cols';

export function decorateTabbedAggResponseWriter() {
  const responseFn = TabbedAggResponseWriter.prototype.response;
  TabbedAggResponseWriter.prototype.response = function () {
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    const decoratedResponse = responseFn.apply(this, arguments);
    applyFormula(this.columns, decoratedResponse);
    // applyHiddenCols(this.columns, decoratedResponse);
    return decoratedResponse;
  };
}
