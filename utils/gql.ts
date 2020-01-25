import api from "./api";
import session from "@src/stores/session";
import _ from "lodash";
import { generateUpdateString } from "./genUpdateString";
import { generateInsertString } from "./genInsertString";
import { generateDeleteString } from "./genDeleteString";

const config = require("../../settings.json");
interface QueryOptions {
  onError?: (e?: any) => void;
  variables?: any;
  operationName?: any;
  headers?: any;
  auth?: boolean;
  raw?: boolean;
  withChildren?: boolean;
}

export const queryAll = async (q: string, options?: QueryOptions) => {
  const headers = {
    "content-type": "application/json",
    ..._.get(options, "headers", {})
  };

  if (_.get(options, "auth", true) && session && session.jwt) {
    headers["Authorization"] = `Bearer ${session.jwt}`;
  }


  try {
    let url = `${config.backend.protocol}://${config.backend.host}:${config.backend.port}/hasura/v1/graphql`;
    if (config.hasura.host) {
      url = `${config.hasura.host}/v1/graphql`;
    }

    const res: any = await api({
      url,
      method: "post",
      headers,
      data: {
        operationName: _.get(options, "operationName"),
        query: q,
        variables: _.get(options, "variables", {})
      }
    });

    if (_.get(options, 'raw', false)) {
      return res;
    }

    if (res && res.data) {
      const keys = Object.keys(res.data);

      const mutate = keys.filter(
        e => e.indexOf("insert_") === 0 || e.indexOf("update_") === 0
      );
      if (mutate.length > 0) {
        if (res.data[mutate[0]].returning.length === 1) {
          return res.data[mutate[0]].returning[0];
        } else if (res.data[mutate[0]].returning) {
          return res.data[mutate[0]].returning;
        } else {
          return res.data[mutate[0]];
        }
      }

      if (keys.length === 1) {
        return res.data[keys[0]];
      }
      return res.data;
    } else {
      if (options && options.onError) {
        options.onError(res);
      }
      return [];
    }
  } catch (e) {
    if (options && options.onError) {
      options.onError(e);
    }
    return [];
  }
};

export const querySingle = async (q: string, options: QueryOptions = {}) => {
  const res = await queryAll(q, options);
  if (res) {
    if (Array.isArray(res)) {
      return res[0];
    }
    const table = Object.keys(res);
    if (table.length > 0 && res[table[0]] && res[table[0]].length > 0) {
      return res[table[0]][0];
    } else {
      return null;
    }
  }
  return res;
};

export const queryInsert = async (tablename: string, data: any, options?: QueryOptions) => {

  const fields = _.map(data, (e, key) => { return { name: key } });
  if (!_.find(fields, { name: 'id' })) {
    fields.push({ name: 'id' });
  }
  const q = generateInsertString({
    name: tablename,
    fields
  }, data, {
    withChildren: _.get(options, 'withChildren')
  });

  const res = await queryAll(q.query, { ...options, variables: q.variables });
  return res;
}

export const queryDelete = async (tablename: string, data: any, options?: QueryOptions) => {
  const q = generateDeleteString({
    name: tablename,
    fields: _.map(data, (e, key) => { return { name: key } })
  }, {
    where: [
      ..._.get(options, 'where', []), {
        name: 'id',
        operator: '_eq',
        value: data['id'],
        valueType: 'IntValue'
      }]
  });

  const res = await queryAll(q.query, { ...options, raw: true });
  if (res.errors) {
    const msg = res.errors.map(e => {
      if (_.get(e, 'extensions.code') === 'constraint-violation') {
        const table = _.trim(e.message.split('" on table "')[1], '"');
        return `  • Please delete all rows on current ${_.startCase(table)}.`;
      }
      return `  • ${e.message}`;
    }).filter(e => !!e);
    alert('Delete failed: \n' + msg.join('\n'));
    return false;
  }
  return res;
}

export const queryUpdate = async (tablename: string, data: any, options?: QueryOptions) => {
  const fields = [] as any;
  Object.keys(data).forEach((e: any) => {
    fields.push({ name: e });
  })

  const q = generateUpdateString({
    name: tablename,
    fields
  }, data, {
    withChildren: _.get(options, 'withChildren'),
    where: [
      ..._.get(options, 'where', []), {
        name: 'id',
        operator: '_eq',
        value: data['id'],
        valueType: 'IntValue'
      }]
  });

  const res = await queryAll(q.query, { ...options, variables: q.variables });
  return res;
}