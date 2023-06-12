import { each, find, get, isArray, isEmpty, map } from 'lodash';
import { formulaParser } from './formula_parser';
// @ts-ignore
import { FieldFormat, FieldFormatsRegistry} from '../../../../../src/plugins/field_formats/common';
// @ts-ignore
import { TabbedAggColumn } from '../../../../../src/plugins/data/common/search/tabify/types';
import { Datatable, DatatableRow } from '../../../../../src/plugins/expressions';

const aggTypeFormulaId = 'datasweet_formula';
const varPrefix = 'agg';
const prefixRegExpr = new RegExp(varPrefix, 'g');

export interface Formula {
  colId: string;
  key: string;
  compiled: any;
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

function compute(datas: SeriesAndFormula) {
  const computed = {};
  each(datas.formulas, (f) => {
    let res = null;
    try {
      res = f.compiled.evaluate(datas.series);
      // @ts-ignore
      computed[f.colId] = { value: res, isArray: isArray(res) };
    } catch (e) {
      res = null;
      // console.log('ERROR', e);
    }
    datas.series[f.key] = res;
  });
  return computed;
}

function mutate(table: Datatable, columns: TabbedAggColumn[]) {
  const datas = extractSeriesAndFormulas(table.rows, columns);

  // Compute and stocks
  const computed = compute(datas);

  // Apply
  if (!isEmpty(computed)) {
    each(table.rows, (row, i) => {
      each(computed, (data, colId) => {
        // @ts-ignore
        row[colId] = data.isArray ? data.value[i] : data.value;
      });
    });
  }
}

export function applyFormula(
  columns: TabbedAggColumn[],
  resp: Datatable
) {
  if (columns.length === 0 || !hasFormulas(columns)) return;
  mutate(resp, columns);
}
