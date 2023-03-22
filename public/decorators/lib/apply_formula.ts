import { each, find, get, isArray, isEmpty, map, lowerCase, includes } from 'lodash';
import { formulaParser } from './formula_parser';
// @ts-ignore
import { FieldFormat, FieldFormatsRegistry} from '../../../../../src/plugins/field_formats/common';
// @ts-ignore
import { TabbedAggColumn } from '../../../../../src/plugins/data/common/search/tabify/types';
import { Datatable, DatatableRow } from '../../../../../src/plugins/expressions';

const aggTypeFormulaId = 'datasweet_formula';
const varPrefix = 'agg';
const prefixRegExpr = new RegExp(varPrefix, 'g');

const formatters = ['number', 'percent', 'boolean', 'bytes', 'numeral'];

export interface Formula {
  colId: string;
  key: string;
  compiled: any;
  formatter?: string;
  numeralFormat?: string;
}

export interface SeriesAndFormula {
  series: any;
  formulas: Formula[];
}

function hasFormulas(cols: any[]) {
  // @ts-ignore
  return find(cols, 'aggConfig.type.name', aggTypeFormulaId) !== undefined;
}

function extractSeriesAndFormulas(rows: DatatableRow[], cols: TabbedAggColumn[]) {
  const res: SeriesAndFormula = { series: {}, formulas: [] };

  each(cols, (c: TabbedAggColumn) => {
    const colId = c.id;
    const key = varPrefix + c.aggConfig.id.replace('.', '_');

    // formula ?
    if (c.aggConfig.type.name === aggTypeFormulaId) {
      const f = get(c.aggConfig.params, 'formula', '')
        .trim()
        // Adds columnGroup to prefix
        .replace(prefixRegExpr, varPrefix);
      if (f.length > 0) {
        res.formulas.push({
          colId,
          key,
          compiled: f.length > 0 ? formulaParser.parse(f) : null,
          formatter: get(c.aggConfig.params, 'formatter', '').trim(),
          numeralFormat: get(c.aggConfig.params, 'numeralFormat', '').trim(),
        });
      }
      res.series[key] = null;
    }

    // series.
    else {
      // TODO: analyze all formulas to build dependencies
      res.series[key] = map(rows, (r) => r[colId]);
    }
  });

  return res;
}

function compute(datas: SeriesAndFormula, fieldFormats: FieldFormatsRegistry) {
  const computed = {};
  each(datas.formulas, (f) => {
    let res = null;
    let fieldFormat = null;
    try {
      res = f.compiled.evaluate(datas.series);
      if (res) {
        let formatter = lowerCase(f.formatter) || 'number';
        let params = {};
        if (f.numeralFormat && formatter === 'numeral') {
          params = { pattern: f.numeralFormat };
        }
        if (formatter === 'numeral' || !includes(formatters, formatter)) {
          formatter = 'number';
        }
        fieldFormat = fieldFormats.getInstance(formatter, params);
      }
      // @ts-ignore
      computed[f.colId] = { value: res, isArray: isArray(res), fieldFormat: fieldFormat };
    } catch (e) {
      res = null;
      // console.log('ERROR', e);
    }
    datas.series[f.key] = res;
  });
  return computed;
}

function mutate(table: Datatable, columns: TabbedAggColumn[], fieldFormats: FieldFormatsRegistry) {
  const datas = extractSeriesAndFormulas(table.rows, columns);

  // Compute and stocks
  const computed = compute(datas, fieldFormats);

  // Apply
  if (!isEmpty(computed)) {
    each(table.rows, (row, i) => {
      each(computed, (data, colId) => {
        // @ts-ignore
        let r = data.isArray ? data.value[i] || null : data.value;
        // @ts-ignore
        row[colId] = r === null ? null : data.fieldFormat?.textConvert(r);
      });
    });
  }
}

export function applyFormula(
  columns: TabbedAggColumn[],
  resp: Datatable,
  fieldFormats: FieldFormatsRegistry
) {
  if (columns.length === 0 || !hasFormulas(columns)) return;
  mutate(resp, columns, fieldFormats);
}
