import _ from "lodash";

export interface ITableOrderBy {
    name: string,
    valueType: string,
    value: string | ITableOrderBy[],
}

export interface ITableWhere {
    name: string,
    operator: string,
    valueType: string,
    value: string | ITableWhere[],
}

export interface ITableOptions {
    offset?: number
    limit?: number
    distinct_on?: string
}

export interface ITable {
    name: string,
    originalName?: string,
    cosntraint?: string,
    fields?: ITable[],
    where?: ITableWhere[],
    args?: any,
    orderBy?: ITableOrderBy[]
    options?: ITableOptions
}

export const generateQueryString = (table: ITable): string => {
    const result = `query { 
${genFields(table)}
${genCounts(table)}
}
`;
    return result;
}

const tabs = (level: number) => {
    let res = "";
    for (let i = 0; i < level; i++) {
        res += '\t';
    }
    return res;
}


export const genArgs = (table: ITable) => {
    if (table.args && Object.keys(table.args).length > 0) {
        const keys = Object.keys(table.args);
        return `args: {${keys.map(e => {
            return `${e}: ${typeof table.args[e] === 'string' ? `"${table.args[e]}"` : table.args[e]}`;
        }).join(',')}}`;
    }
}
export const genWhere = (where: ITableWhere[], level = 0): string => {
    const result = [] as any;
    (where || []).map((w: ITableWhere) => {
        let value = w.value;
        if (w.valueType === 'ObjectValue') {
            value = genWhere(w.value as ITableWhere[], level + 1);
            result.push(`${w.name}:${value}`);
            return;
        } else if (w.valueType === 'StringValue') {
            value = JSON.stringify(w.value);
        } else if (w.valueType === 'ArrayValue') {
            value = JSON.stringify(w.value);
        }
        result.push(`${w.name}:{${w.operator}: ${value}}`)
    })

    if (result.length > 0) {
        return `${level === 0 ? `where:` : ``} {${result.join(', ')}}`;
    }
    return '';
}

const genOrderBy = (orderBy: ITableOrderBy[], level = 0): string => {
    const result = [] as any;
    (orderBy || []).map((w: ITableOrderBy) => {
        let value = w.value;
        if (w.valueType === 'ObjectValue') {
            value = genOrderBy(w.value as ITableOrderBy[], level + 1);
            result.push(`${w.name}: ${value}`);
            return;
        } else if (w.valueType === 'StringValue') {
            value = w.value;
        }
        result.push(`${w.name}: ${value}`)
    })

    if (result.length > 0) {
        return `${level === 0 ? `order_by:` : ``} {${result.join(', ')}}`;
    }
    return '';
}


export const genCounts = (table: ITable, options?: {
    showArgs?: boolean
}, level = 1): string => {
    const args: any = [];

    const dargs = genArgs(table);
    if (dargs) {
        args.push(dargs);
    }

    if (_.get(options, 'showArgs', true)) {
        if (table.where) {
            const where = genWhere(table.where);
            if (where) args.push(where);
        }
    }

    return `${tabs(level)}${table.name}_aggregate${args.length > 0 ? `(${args.join(', ')})` : ''} { 
    aggregate {
        count
      }
${tabs(level)}}`;
}



export const genFields = (table: ITable, options?: {
    showArgs?: boolean
    withFirstTable?: boolean
    depth?: -1
}, level = 1): string => {
    const fields = _.get(table, "fields", []) as ITable[];

    const args: any = [];

    const dargs = genArgs(table);
    if (dargs) {
        args.push(dargs);
    }

    if (_.get(options, 'showArgs', true)) {
        if (table.where) {
            const where = genWhere(table.where);
            if (where) args.push(where);
        }

        if (table.orderBy) {
            const orderBy = genOrderBy(table.orderBy);
            if (orderBy) args.push(orderBy);
        }

        if (table.options) {
            if (table.options.limit) { args.push(`limit: ${table.options.limit}`) }
            if (table.options.offset) { args.push(`offset: ${table.options.offset}`) }
            if (table.options.distinct_on) { args.push(`distinct_on: ${table.options.distinct_on}`) }
        }
    }

    if (_.get(options, 'withFirstTable', true) === false) {
        return fields.map((f: any) => {
            if (f.fields) {
                return `${genFields(f, { ...options, withFirstTable: true }, level + 1)}`;
            }
            let name = f.name;
            if (f.originalName) {
                name = `${f.name}:${f.originalName}`
            }
            return `${tabs(level + 1)}${name}`;
        }).join('\n');

    }

    let name = table.name;
    if (table.originalName) {
        name = `${table.name}:${table.originalName}`
    }
    return `${tabs(level)}${name}${args.length > 0 ? `(${args.join(', ')})` : ''} {
${fields.map((f: any) => {
        if (f.fields) {
            return `${genFields(f, options, level + 1)}`;
        }
        let name = f.name;
        if (f.originalName) {
            name = `${f.name}:${f.originalName}`
        }
        return `${tabs(level + 1)}${name}`;
    }).join('\n')}
${tabs(level)}}`;
}
