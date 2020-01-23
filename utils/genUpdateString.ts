import { ITable, genFields, genWhere, ITableWhere } from "./genQueryString";
import _ from 'lodash';
import { dateFormat } from "./date";

export const generateUpdateString = (table: ITable, data: any, options: {
    where: ITableWhere[],
    returnData?: boolean
}): { query: string, variables: any } => {

    const where = genWhere(options.where) || `where: {}`;

    const dataWithoutChildren: any = {};
    Object.keys(data).map((key: any) => {
        const d: any = data[key];
        if (typeof d !== 'object') {
            dataWithoutChildren[key] = d;
        } else {
            if (d instanceof Date) {
                dataWithoutChildren[key] = dateFormat(d, 'sql');
            }
        }
    })
    return {
        query: `mutation Update($data:${table.name}_set_input) {
    update_${table.name}(_set: $data, ${where}) {
        affected_rows
        ${_.get(options, 'returnData', true) ? `returning {
${genFields(table, { showArgs: false, withFirstTable: false }, 2)}
        }` : ''}
    }  
}`,
        variables: {
            data: dataWithoutChildren
        }
    };
}