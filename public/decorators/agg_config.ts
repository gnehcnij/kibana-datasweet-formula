import { AggConfig } from '../../../../src/plugins/data/common';
import { ExpressionAstExpression } from '../../../../src/plugins/expressions';

export function decorateAggConfig() {
  const toExpressionAstFn = AggConfig.prototype.toExpressionAst;
  AggConfig.prototype.toExpressionAst = function () {
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    const decoratedAstExpression: ExpressionAstExpression = toExpressionAstFn.apply(this, arguments);
    decoratedAstExpression.chain[0].arguments.hidden = this.hidden;
    return decoratedAstExpression;
  };
}
