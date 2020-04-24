import { dateFormat } from "@src/libs/utils/date";
import { generateQueryString } from "@src/libs/utils/genQueryString";
import { queryAll } from "@src/libs/utils/gql";
import _ from "lodash";
import { toJS } from "mobx";
import { columnDefs } from "..";

export default async (opt: {
  structure: any;
  paging: any;
  filter: any;
  idKey: string;
}) => {
  const { structure, paging, filter, idKey } = opt;
  const currentPage = _.get(paging, "current", 1);
  const fk = structure.fkeys && structure.fkeys[idKey];
  const orderBy =
    structure.orderBy.length > 0
      ? structure.orderBy
      : fk
        ? [
          {
            name: idKey,
            value: "desc",
            valueType: "StringValue",
          },
        ]
        : [];

  let where: any = [];
  if (structure.where) {
    where = _.cloneDeep(structure.where);
  }

  const filterCols = _.get(filter, "columns", {});
  if (!filter.initDefault) {
    Object.keys(filterCols).map((i) => {
      if (!filter.form) {
        filter.form = {};
      }

      if (filterCols[i].default && filter.form[i] === undefined) {
        if (typeof filterCols[i].default === "function") {
          filter.form[i] = filterCols[i].default();
        } else {
          filter.form[i] = filterCols[i].default;
        }
      }
    });
    filter.initDefault = true;
  }

  const args = {};
  if (filter && filter.form) {
    const colDef = _.get(columnDefs, `${structure.name}`);

    for (let i in filter.form) {
      let value = filter.form[i];
      let operator = "";
      let vtype = "";
      let valueType: string = typeof value;
      let subdot = null as any;
      let subdotcur = null as any;

      const cold = _.find(colDef, { column_name: i });
      const colType = _.get(cold, "data_type");
      if (colType) {
        valueType = colType;
      }

      if (filterCols[i]) {
        if (filterCols[i].type) {
          valueType = filterCols[i].type;
        }
      }

      if (value && value._mode === "args") {
        if (value.value instanceof Date) {
          args[i] = dateFormat(value.value, "yyyy-MM-dd HH:mm:ss");
        } else {
          args[i] = value.value;
        }
        vtype = "";
      } else {
        if (i.indexOf(".") > 0) {
          const it = i.split(".");
          let obj = {};
          let cur: any = obj;
          let cdef1st = {};
          colDef.forEach((e) => (cdef1st[e.column_name] = e));
          let cdef = _.get(cdef1st, it.join(".columns."));
          for (let k in it) {
            const t = it[k];
            cur.name = t;
            cur.valueType = "ObjectValue";
            cur.value = [{}];
            if ((k as any) * 1 < it.length - 1) {
              cur = cur.value[0];
            }
          }
          if (cdef) {
            valueType = cdef.data_type;
            subdotcur = cur;
            subdot = obj;
          }
        }

        switch (valueType) {
          case "object":
            if (Array.isArray(toJS(value))) {
              vtype = "ArrayValue";
              operator = "_in";
            } else {
              vtype = "ObjectValue";
              operator = "_eq";
            }
            break;
          case "number":
          case "integer":
          case "relation":
            vtype = "IntValue";
            operator = "_eq";
            break;
          case "date":
          case "timestamp without time zone":
          case "timestamp with time zone":
            if (typeof value) {
              if (value.from) {
                vtype = "";
                where.push({
                  name: i,
                  operator: "_gte",
                  value: dateFormat(value.from, "yyyy-MM-dd HH:mm:ss"),
                  valueType: "StringValue",
                });
                where.push({
                  name: "_and",
                  valueType: "ObjectValue",
                  value: [
                    {
                      name: i,
                      operator: "_lte",
                      value: dateFormat(value.to, "yyyy-MM-dd HH:mm:ss"),
                      valueType: "StringValue",
                    },
                  ],
                });
              } else {
                vtype = "StringValue";
                operator = "_eq";
                value = dateFormat(value, "yyyy-MM-dd HH:mm:ss");
              }
            }
            break;
          case "string":
          case "character varying":
          case "text":
            vtype = "StringValue";
            operator = "_ilike";
            value = `%${value}%`;
            break;
          case "double precision":
            vtype = "float8";
            operator = "_eq";
            value = `${value}`;
            break;
        }
      }
      if (vtype) {
        if (subdot) {
          subdotcur.valueType = vtype;
          subdotcur.operator = operator;
          subdotcur.value = value;
          where.push(subdot);
        } else {
          where.push({
            name: i,
            operator,
            value,
            valueType: vtype,
          });
        }
      }
    }
  }

  const fields = _.cloneDeep(structure.fields);
  const ovrd = structure.overrideForm || {};
  _.map(columnDefs[structure.name], (e, k) => {
    const name = e.column_name;
    if (
      e.is_nullable === "NO" &&
      name !== "id" &&
      !ovrd[name] &&
      !e.column_default
    ) {
      const col = _.find(fields, { name });
      if (!col) {
        fields.push({ name });
      }
    }
  });

  const query = generateQueryString({
    ...structure,
    fields,
    where,
    orderBy,
    args,
    options: {
      ...structure.options,
      limit: paging.itemPerPage,
      offset: (currentPage - 1) * paging.itemPerPage,
    },
  });

  const res = await queryAll(query, { auth: structure.auth });
  return res[structure.name];
};
