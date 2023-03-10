import { i18n } from '@kbn/i18n';
import { AggConfigSerialized, AggExpressionType } from '../../../../src/plugins/data/common';
// @ts-ignore
import { ExpressionFunctionDefinition } from '../../../../src/plugins/expressions';
import { AggParamsMapping, METRIC_TYPES } from './datasweet_formula';

export const datasweetFormulaFnName = 'datasweetFormula';

export type AggExpressionFunctionArgs<Name extends keyof AggParamsMapping> =
  AggParamsMapping[Name] & Pick<AggConfigSerialized, 'id' | 'enabled' | 'schema'>;

type Input = any;
type AggArgs = AggExpressionFunctionArgs<typeof METRIC_TYPES.DATASWEET_FORMULA>;
type Output = AggExpressionType;
type FunctionDefinition = ExpressionFunctionDefinition<
  typeof datasweetFormulaFnName,
  Input,
  AggArgs,
  Output
>;

export const datasweetFormula = (): FunctionDefinition => ({
  name: datasweetFormulaFnName,
  help: i18n.translate('data.search.aggs.function.metrics.max.help', {
    defaultMessage: 'Generates a serialized agg config for a Max agg',
  }),
  type: 'agg_type',
  args: {
    id: {
      types: ['string'],
      help: i18n.translate('data.search.aggs.metrics.max.id.help', {
        defaultMessage: 'ID for this aggregation',
      }),
    },
    enabled: {
      types: ['boolean'],
      default: true,
      help: i18n.translate('data.search.aggs.metrics.max.enabled.help', {
        defaultMessage: 'Specifies whether this aggregation should be enabled',
      }),
    },
    schema: {
      types: ['string'],
      help: i18n.translate('data.search.aggs.metrics.max.schema.help', {
        defaultMessage: 'Schema to use for this aggregation',
      }),
    },
    json: {
      types: ['string'],
      help: i18n.translate('data.search.aggs.metrics.max.json.help', {
        defaultMessage: 'Advanced json to include when the agg is sent to Elasticsearch',
      }),
    },
    formula: {
      types: ['string'],
      help: i18n.translate('data.search.aggs.metrics.max.json.help', {
        defaultMessage: 'Formula string to calculate agg value',
      }),
    },
    formatter: {
      types: ['string'],
      help: i18n.translate('data.search.aggs.metrics.max.json.help', {
        defaultMessage: 'Formatter to format the result of formula agg',
      }),
    },
    customLabel: {
      types: ['string'],
      help: i18n.translate('data.search.aggs.metrics.max.customLabel.help', {
        defaultMessage: 'Represents a custom label for this aggregation',
      }),
    },
    timeShift: {
      types: ['string'],
      help: i18n.translate('data.search.aggs.metrics.timeShift.help', {
        defaultMessage:
          'Shift the time range for the metric by a set time, for example 1h or 7d. "previous" will use the closest time range from the date histogram or time range filter.',
      }),
    },
  },
  fn: (input, args) => {
    const { id, enabled, schema, ...rest } = args;

    return {
      type: 'agg_type',
      value: {
        id,
        enabled,
        schema,
        type: METRIC_TYPES.DATASWEET_FORMULA,
        params: {
          ...rest,
        },
      },
    };
  },
});
