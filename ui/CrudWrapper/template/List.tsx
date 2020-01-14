import * as React from 'react';
import { DetailsList, ColumnActionsMode, SelectionMode } from 'office-ui-fabric-react';
import _ from 'lodash';
import { dateFormat } from '@src/libs/utils/date';

export default ({ table, list, colDef, fkeys }: any) => {
    const columns = generateColumns(table, colDef, fkeys);
    return <DetailsList
        selectionMode={SelectionMode.none}
        items={list}
        onItemInvoked={() => {
            console.log('mantab');
        }}
        columns={columns} />;
}

const generateColumns = (table, colDef, fkeys) => {
    const cols = table.head.children.map((e, idx) => {
        return {
            ...e.props,
            children: _.get(table, `row.children.${idx}.props.children`)
        }
    })

    return cols.map(e => {
        return {
            key: e.path,
            name: e.title,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: any) => {
                const cdef = colDef[e.path];
                const value = _.get(item, e.path);
                if (cdef) {
                    if (cdef.data_type.indexOf('timestamp') >= 0 || cdef.data_type === 'date') {
                        return dateFormat(value);
                    }
                }
                return value;
            }
        }
    });

}

