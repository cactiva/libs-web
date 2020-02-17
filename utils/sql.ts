import api from "./api";
import session from "@src/stores/session";
import _ from "lodash";
import { toJS } from "mobx";
import { startCase } from ".";

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

export const querySQL = async (q: string, options?: QueryOptions) => {
    const headers = {
        "content-type": "application/json",
        ..._.get(options, "headers", {})
    };

    if (_.get(options, "auth", true) && session && session.jwt) {
        headers["Authorization"] = `Bearer ${session.jwt}`;
    }

    try {
        let url = `${config.backend.protocol}://${config.backend.host}:${config.backend.port}/hasura/v1/query`;
        if (config.hasura.host) {
            url = `${config.hasura.host}/v1/query`;
        }

        console.log(url)
        const res: any = await api({
            url,
            method: "post",
            headers,
            data: {
                type: "run_sql",
                args: {
                    sql: q
                }
            }
        });

        if (_.get(options, 'raw', false)) {
            return res;
        }

        if (res && res.result) {
            let tuple_convert: any = [];
            const keys: any = [];
            res.result[0].map((val) => {
                keys.push(val);
            })
            res.result.shift();
            res.result.map((val) => {
                let tuples: any = [];
                val.map((item, index) => {
                    tuples = { ...tuples, [keys[index]]: item }
                })
                tuple_convert.push(tuples);
            })
            return tuple_convert;
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
}