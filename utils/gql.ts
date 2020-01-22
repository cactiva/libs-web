import api from "./api";
import session from "@src/stores/session";
import _ from "lodash";

const config = require("../../settings.json");
interface QueryOptions {
  onError?: (e?: any) => void;
  variables?: any;
  operationName?: any;
  headers?: any;
  auth?: boolean;
  raw?: boolean;
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
