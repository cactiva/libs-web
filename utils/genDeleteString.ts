import { ITable, genFields, genWhere, ITableWhere } from "./genQueryString";
import _ from 'lodash';

export const generateDeleteString = (table: ITable, options: {
    where: ITableWhere[],
    returnData?: boolean
}): { query: string } => {

    const where = genWhere(options.where) || `where: {}`;
    return {
        query: `mutation Delete {
    delete_${table.name}(${where}) {
        affected_rows
        ${_.get(options, 'returnData', true) ? `returning {
${genFields(table, { showArgs: false, withFirstTable: false }, 2)}
        }` : ''}
    }  
}`
    };
}