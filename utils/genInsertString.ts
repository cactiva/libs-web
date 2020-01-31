import { ITable, genFields } from "./genQueryString";
import _ from 'lodash';
import { dateFormat } from "./date";

export const generateInsertString = (table: ITable, data: any, options?: {
    returnData?: boolean,
    withChildren?: boolean
}): { query: string, variables: any, key } => {
    const preparedRow = {} as any;
    Object.keys(data).map(k => {
        if (k !== '__insertid') {
            if (data[k] instanceof Date) {
                preparedRow[k] = dateFormat(data[k], 'sql');
            } else if (_.get(options, 'withChildren', false) || typeof data[k] !== 'object') {
                preparedRow[k] = data[k]
            }
        }
    })
    return {
        key: `insert_${table.name}`,
        query: `mutation Insert($data:[${table.name}_insert_input!]!) {
    insert_${table.name}(objects: $data) {
        affected_rows
        ${_.get(options, 'returnData', true) ? `returning {
${genFields(table, { showArgs: false, withFirstTable: false }, 2)}
        }` : ''}
    }  
}`,
        variables: {
            data: preparedRow
        }
    };
}