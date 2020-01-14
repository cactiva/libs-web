import { ITable, genFields } from "./genQueryString";
import _ from 'lodash';

export const generateInsertString = (table: ITable, data: any, options?: {
    returnData?: boolean
}): { query: string, variables: any } => {

    const preparedRow = {} as any;
    Object.keys(data).map(k => {
        if (k !== '__insertid') {
            if (typeof data[k] !== 'object') {
                preparedRow[k] = data[k]
            }
        }
    })
    return {
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