import { TabbedAggResponseWriter } from '../../../../src/plugins/data/common';
import { applyFormula } from './lib/apply_formula';
import { applyHiddenCols } from './lib/apply_hidden_cols';
import { Datatable } from '../../../../src/plugins/expressions';
// @ts-ignore
import { FieldFormatsRegistry } from '../../../../src/plugins/field_formats/common';

export function decorateTabbedAggResponseWriter(fieldFormats: FieldFormatsRegistry) {
  const responseFn = TabbedAggResponseWriter.prototype.response;
  TabbedAggResponseWriter.prototype.response = function () {
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    const decoratedResponse: Datatable = responseFn.apply(this, arguments);
    applyFormula(this.columns, decoratedResponse, fieldFormats);
    applyHiddenCols(this.columns, decoratedResponse);
    return decoratedResponse;
  };
}
