import math from 'expr-eval';
import { each, isArray, map } from 'lodash';
// @ts-ignore
import * as formulas from '../../formulas';

export class FormulaParser {
  private readonly parser: math.Parser;
  constructor() {
    this.parser = new math.Parser({
      operators: {
        conditional: false,
      },
    });
    const parser = this.parser;

    // Redefine unary operators to work with series.
    each(parser.unaryOps, (func, funcName) => {
      const fn = func;
      parser.unaryOps[funcName] = (x: any) => {
        if (isArray(x)) {
          return map(x, (r) => fn.call(undefined, Number(r)));
        } else {
          return fn.call(undefined, Number(x));
        }
      };
    });

    // Redefine binary operators to work with series.
    each(parser.binaryOps, (func, funcName) => {
      const fn = func;
      parser.binaryOps[funcName] = (a: any, b: any) => {
        const ia = isArray(a);
        const ib = isArray(b);

        if (ia && ib) {
          const c = [];
          const len = Math.max(a.length, b.length);
          for (let i = 0; i < len; i++) {
            c.push(fn.call(undefined, a[i] || 0, b[i] || 0));
          }
          return c;
        }

        if (ia) {
          return map(a, (r) => fn.call(undefined, r, b));
        }

        if (ib) {
          return map(b, (r) => fn.call(undefined, a, r));
        }

        return fn.call(undefined, a, b);
      };
    });

    // remove default functions
    parser.functions = {};
    this.addDefautFunctions();
  }

  private addDefautFunctions() {
    this.parser.functions = {};
    each(formulas, (f) => this.addFunc(f));
  }

  private addFunc(f: any) {
    this.parser.functions[f.name] = f.fn;
  }

  public parse(expr: string) {
    return this.parser.parse(expr);
  }

  public evaluate(expr: string, vars: any) {
    return this.parser.evaluate(expr, vars);
  }
}

export const formulaParser = new FormulaParser();
