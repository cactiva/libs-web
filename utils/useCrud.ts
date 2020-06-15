import gql from "graphql-tag";
import _ from "lodash";
import useAsyncEffect from "use-async-effect";

export const useCrud = (meta: any, metaField: string, query: (() => Promise<string>) | string) => {
  useAsyncEffect(async () => {
    let struct = {} as any;
    try {
      if (typeof query === "string") {
        struct = gql`
        ${query}
      `;
      } else {
        struct = gql`
        ${await query()}
      `;
      }
    } catch (e) {
      console.log(e);
      return undefined;
    }
    const root = _.get(struct, "definitions.0.selectionSet.selections.0");
    const result = {
      structure: parseTable(root),
      auth: true,
      list: [],
      form: {},
      sorting: {},
      paging: {},
      filter: {},
    };
    meta[metaField] = result;
  }, []);
};
interface ITableOrderBy {
  name: string;
  valueType: string;
  value: string | ITableOrderBy[];
}

interface ITableWhere {
  name: string;
  operator: string;
  valueType: string;
  value: string | ITableWhere[];
}

interface ITableOptions {
  offset?: number;
  limit?: number;
  distinct_on?: string;
}

interface ITable {
  name: string;
  originalName?: string;
  fields?: ITable[];
  where?: ITableWhere[];
  orderBy?: ITableOrderBy[];
  args?: any;
  options?: ITableOptions;
}

export const parseTable = (table: any): ITable => {
  const name = _.get(table, "name.value");
  const fields = _.get(table, "selectionSet.selections", []).map((e: any) => {
    if (!!_.get(e, "selectionSet")) {
      let childTable = parseTable(e);
      return childTable;
    }
    const result = { name: _.get(e, "name.value") } as any;
    const alias = _.get(e, "alias.value");
    if (alias) {
      result.originalName = _.get(e, "name.value");
      result.name = alias;
    }
    return result;
  });

  const where = [] as ITableWhere[];
  const orderBy = [] as ITableOrderBy[];
  const options = {} as any;
  const args = {} as any;

  const parseWhere = (e: any) => {
    return _.get(e, "value.fields").map((w: any) => {
      const item = {
        name: _.get(w, "name.value"),
        operator: _.get(w, "value.fields.0.name.value"),
        valueType: _.get(w, "value.fields.0.value.kind"),
        value: _.get(w, "value.fields.0.value.value"),
      };

      if (item.valueType === "ListValue") {
        item.value = _.get(w, "value.fields.0.value.values").map(
          (e) => e.value
        );
      }

      if (item.valueType === "ObjectValue") {
        item.value = parseWhere(w);
      }
      return item;
    });
  };
  const parseOrderBy = (e: any) => {
    return _.get(e, "value.fields").map((w: any) => {
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

  _.get(table, "arguments", []).map((e: any) => {
    const argType = _.get(e, "name.value");
    if (argType === "args") {
      _.get(table, "arguments.0.value.fields", []).map((a: any) => {
        args[_.get(a, "name.value")] = _.get(a, "value.value");
      });
    } else if (argType === "where") {
      parseWhere(e).map((w: any) => where.push(w));
    } else if (argType === "order_by") {
      parseOrderBy(e).map((w: any) => orderBy.push(w));
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
