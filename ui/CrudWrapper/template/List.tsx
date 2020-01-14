import * as React from 'react';
import { DetailsList, ColumnActionsMode, SelectionMode } from 'office-ui-fabric-react';
import _ from 'lodash';
import { dateFormat } from '@src/libs/utils/date';
import NiceValue from '../../Field/NiceValue';
import Filter from './filter';

export default ({ table, reload, list, filter, colDef, fkeys, setMode }: any) => {
    const columns = generateColumns(table, colDef, fkeys);
    return <>
        <Filter filter={filter} reload={reload} columns={columns} colDef={colDef} fkeys={fkeys} />
        <DetailsList
            selectionMode={SelectionMode.single}
            items={list || []}
            onItemInvoked={() => {
                setMode('edit');
            }}
            onRenderCheckbox={() => { return null; }}
            columns={columns} />
    </>;
}

const generateColumns = (table, colDef, fkeys) => {
    const cols = table.head.children.map((e, idx) => {
        return {
            ...e.props,
            children: _.get(table, `row.children.${idx}.props.children`)
        }
    })

    return cols.map((e: any) => {
        return {
            key: e.path,
            name: e.title,
            maxWidth: 200,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: any) => {
                const cdef = colDef[e.path];
                const value = _.get(item, e.path);
                let valueEl: any = null;
                if (cdef) {
                    if (cdef.data_type.indexOf('timestamp') >= 0 || cdef.data_type === 'date') {
                        valueEl = dateFormat(value);
                    }
                }
                if (typeof value === 'string') {
                    valueEl = value;
                }

                if (typeof value === "object") {
                    valueEl = <NiceValue value={value} />;
                }
                return valueEl;
            }
        }
    });

}

