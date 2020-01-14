import _ from 'lodash';
import { toJS } from 'mobx';
import { generateQueryString } from '@src/libs/utils/genQueryString';
import { queryAll } from '@src/libs/utils/gql';
import { columnDefs } from '..';
import { dateFormat } from '@src/libs/utils/date';

export default async (opt: { structure: any, paging: any, filter: any, idKey: string }) => {
    const { structure, paging, filter, idKey } = opt;
    const currentPage = _.get(paging, 'current', 1)
    const fk = structure.fkeys && structure.fkeys[idKey];
    const orderBy = structure.orderBy.length > 0 ? structure.orderBy : fk ? [{
        name: idKey,
        value: 'desc',
        valueType: 'StringValue'
    }] : [];

    let where: any = [];
    if (structure.where) {
        where = _.cloneDeep(structure.where);
    }

    const filterCols = _.get(filter, 'columns', {});


    if (!filter.initDefault) {
        Object.keys(filterCols).map(i => {
            if (!filter.form) {
                filter.form = {};
            }

            if (filterCols[i].default && filter.form[i] === undefined) {
                if (typeof filterCols[i].default === 'function') {
                    filter.form[i] = filterCols[i].default();
                } else {
                    filter.form[i] = filterCols[i].default;
                }
            }
        })
        filter.initDefault = true;
    }


    if (filter && filter.form) {
        const colDef = _.get(columnDefs, `${structure.name}.columns`);
        for (let i in filter.form) {
            let value = filter.form[i];
            let operator = "";
            let vtype = "";
            let valueType: string = typeof value;

            const cold = _.find(colDef, { column_name: i });
            const colType = _.get(cold, 'data_type');
            if (colType) {
                valueType = colType;
            }

            if (filterCols[i]) {
                if (filterCols[i].type) {
                    valueType = filterCols[i].type;
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
                case "relation":
                    vtype = "IntValue";
                    operator = "_eq";
                    break;

                case "timestamp without time zone":
                case "timestamp with time zone":
                    if (value) {
                        vtype ="StringValue";
                        operator = "_eq";
                        value = dateFormat(value, 'yyyy-MM-dd HH:mm:ss');
                    } 
                    break;
                case "string":
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

            if (vtype) {
                where.push({
                    name: i,
                    operator,
                    value,
                    valueType: vtype
                })
            }
        }
    }
    const query = generateQueryString({
        ...structure,
        where,
        orderBy,
        options: {
            ...structure.options,
            limit: paging.itemPerPage,
            offset: (currentPage - 1) * paging.itemPerPage
        }
    });

    const res = await queryAll(query, { auth: structure.auth });

    // _.map(res, (e) => {
    //     if (e.aggregate) {
    //         const count = e.aggregate.count
    //         data.paging.count = count;
    //         if (!data.paging.current)
    //             data.paging.current = 1;
    //         data.paging.total = Math.ceil(count / paging.itemPerPage);
    //     } else {
    //         data.list = e || [];
    //     }
    // });

    return res[structure.name];
}