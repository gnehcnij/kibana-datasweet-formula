import { includes, each, reject } from 'lodash';
import { Datatable } from '../../../../../src/plugins/expressions';
// @ts-ignore
import { TabbedAggColumn } from '../../../../../src/plugins/data/common/search/tabify/types';

function mutate(table: Datatable, hiddenCols: string[]) {
  table.columns = reject(table.columns, (c) => includes(hiddenCols, c.id));
}

export function applyHiddenCols(columns: TabbedAggColumn[], resp: Datatable) {
  const hiddenCols: string[] = [];
  each(columns, (c) => {
    if (c.aggConfig.hidden) {
      hiddenCols.push(c.id);
    }
  });
  if (hiddenCols.length > 0) {
    mutate(resp, hiddenCols);
  }
}
