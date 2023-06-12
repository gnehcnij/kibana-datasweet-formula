import { lowerCase, includes } from 'lodash';
// @ts-ignore
import {
  BaseAggParams,
  IAggConfig,
  IMetricAggConfig,
  MetricAggParam,
  MetricAggType,
} from '../../../../src/plugins/data/common';

// @ts-ignore
import { SerializedFieldFormat, FieldFormatParams} from "../../../../src/plugins/field_formats/common";

import { datasweetFormulaFnName } from './datasweet_formula_fn';

const aggName = 'datasweet_formula';
const aggTitle = 'Datasweet Formula';
const formatters = ['number', 'percent', 'boolean', 'bytes', 'numeral'];

export const datasweetFormulaType = 'Calculated Metrics';

export interface AggParamsDatasweetFormula extends BaseAggParams {
  formula: string;
  formatter: string;
  numeralFormat: string;
  hidden: boolean;
}

export interface AggParamsMapping {
  [aggName]: AggParamsDatasweetFormula;
}

export enum METRIC_TYPES {
  DATASWEET_FORMULA = 'datasweet_formula',
}

export const getDatasweetFormulaMetricAgg = () => {
  return new MetricAggType({
    name: aggName,
    expressionName: datasweetFormulaFnName,
    title: aggTitle,
    valueType: 'number',
    subtype: datasweetFormulaType,
    hasNoDsl: true,
    makeLabel: (aggConfig) => 'Formula ' + aggConfig.id,
    params: [
      {
        name: 'formula',
        type: 'string',
        displayName: 'Formula input',
      },
      {
        name: 'formatter',
        type: 'string',
        displayName: 'Formatter input, one of [Number(default), Percent, Boolean, Bytes, Numeral]',
      },
      {
        name: 'numeralFormat',
        type: 'string',
        displayName: 'Numeral.js format',
        required: false,
      },
    ] as Array<MetricAggParam<IMetricAggConfig>>,
    getValue(agg, bucket) {
      return null;
    },
    getSerializedFormat: (aggConfig : IAggConfig) => {
      let formatter = lowerCase(aggConfig.params.formatter) || 'number';
      let params: FieldFormatParams = {};
      if (aggConfig.params.numeralFormat && formatter === 'numeral') {
        params = { pattern: aggConfig.params.numeralFormat };
      }
      if (formatter === 'numeral' || !includes(formatters, formatter)) {
        formatter = 'number';
      }
      const serializedFieldFormat: SerializedFieldFormat<FieldFormatParams> = {
        id: formatter,
        params: params,
      };
      return serializedFieldFormat;
    },
  });
};
