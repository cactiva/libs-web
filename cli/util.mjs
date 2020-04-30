import _ from "lodash";
import morph from "ts-morph";

const SyntaxKind = morph.SyntaxKind;
export const defaultExportShallow = (sf) => {
  if (!sf) return null;
  const expt = sf.getFirstChildByKind(SyntaxKind.ExportAssignment);
  if (expt) {
    let array = null;

    try {
      array = expt
        .getFirstChildByKindOrThrow(SyntaxKind.ArrowFunction)
        .getFirstChildByKindOrThrow(SyntaxKind.Block);
    } catch (e) {
      array = expt
        .getFirstChildByKindOrThrow(SyntaxKind.CallExpression)
        .getFirstChildByKindOrThrow(SyntaxKind.ArrowFunction)
        .getFirstChildByKindOrThrow(SyntaxKind.Block);
    }

    if (array === null) return null;

    return array;
  }

  return null;
};

export const getQuery = (sf) => {
  try {
    const de = defaultExportShallow(sf);
    const stmts = _.get(de, "compilerNode.statements", []);
    return stmts
      .map((e) => {
        if (e.expression && e.expression) {
          if (e.expression.kind === SyntaxKind.CallExpression) {
            if (
              e.expression.expression &&
              e.expression.expression.escapedText === "useCrud"
            ) {
              const ep = e.expression.arguments[2];
              const text = ep.getText();
              return text.substr(1, text.length - 2);
            }
          }
        }
      })
      .filter((e) => e)
      .join("");
  } catch (e) {
    return "";
  }
};

export const getReturn = (sf) => {
  try {
    const de = defaultExportShallow(sf);
    const stmts = _.get(de, "compilerNode.statements", []);
    return stmts
      .map((e) => {
        if (e.kind === 235) {
          return e;
        }
      })
      .filter((e) => e)[0];
  } catch (e) {
    return null;
  }
};

export function replaceRange(s, start, end, substitute) {
  return s.substring(0, start) + substitute + s.substring(end);
}

export const parseTable = (table) => {
  const name = _.get(table, "name.value");
  const fields = _.get(table, "selectionSet.selections", []).map((e) => {
    if (!!_.get(e, "selectionSet")) {
      let childTable = parseTable(e);
      return childTable;
    }
    const result = { name: _.get(e, "name.value") };
    const alias = _.get(e, "alias.value");
    if (alias) {
      result.originalName = _.get(e, "name.value");
      result.name = alias;
    }
    return result;
  });

  const where = [];
  const orderBy = [];
  const options = {};
  const args = {};

  const parseWhere = (e) => {
    return _.get(e, "value.fields").map((w) => {
      const item = {
        name: _.get(w, "name.value"),
        operator: _.get(w, "value.fields.0.name.value"),
        valueType: _.get(w, "value.fields.0.value.kind"),
        value: _.get(w, "value.fields.0.value.value"),
      };
      if (item.valueType === "ObjectValue") {
        item.value = parseWhere(w);
      }
      return item;
    });
  };
  const parseOrderBy = (e) => {
    return _.get(e, "value.fields").map((w) => {
      const item = {
        name: _.get(w, "name.value"),
        value: _.get(w, "value.value"),
        valueType: _.get(w, "value.kind"),
      };
      if (item.valueType === "ObjectValue") {
        item.value = parseOrderBy(w);
      }
      return item;
    });
  };

  _.get(table, "arguments", []).map((e) => {
    const argType = _.get(e, "name.value");
    if (argType === "args") {
      _.get(table, "arguments.0.value.fields", []).map((a) => {
        args[_.get(a, "name.value")] = _.get(a, "value.value");
      });
    } else if (argType === "where") {
      parseWhere(e).map((w) => where.push(w));
    } else if (argType === "order_by") {
      parseOrderBy(e).map((w) => orderBy.push(w));
    } else if (argType === "limit") {
      options.limit = _.get(e, "value.value");
    } else if (argType === "offset") {
      options.offset = _.get(e, "value.value");
    } else if (argType === "distinct_on") {
      options.distinct_on = _.get(e, "value.value");
    }
  });

  return {
    name,
    fields,
    where,
    args,
    orderBy,
    options,
  };
};
