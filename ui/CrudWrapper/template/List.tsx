import * as React from 'react';
import { DetailsList, ColumnActionsMode, SelectionMode, IDetailsHeaderProps, IRenderFunction, Sticky, DetailsListLayoutMode } from 'office-ui-fabric-react';
import _ from 'lodash';
import { dateFormat } from '@src/libs/utils/date';
import NiceValue from '../../Field/NiceValue';
import Filter from './filter';

export default ({ table, reload, setForm, list, filter, colDef, fkeys, setMode }: any) => {
    const columns = generateColumns(table, colDef, fkeys);
    return <>
        <Filter
            filter={filter}
            reload={reload}
            columns={columns}
            colDef={colDef}
            fkeys={fkeys} />
        <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'auto' }}>
                <DetailsList
                    selectionMode={SelectionMode.single}
                    items={list || []}
                    onItemInvoked={(e) => {
                        setForm(e);
                        setMode('edit');
                    }}
                    onRenderDetailsHeader={
                        (detailsHeaderProps?: IDetailsHeaderProps, defaultRender?: IRenderFunction<IDetailsHeaderProps>) => (
                            <Sticky>
                                {defaultRender && defaultRender(detailsHeaderProps)}
                            </Sticky>
                        )}
                    layoutMode={DetailsListLayoutMode.fixedColumns}
                    onRenderCheckbox={() => { return null; }}
                    columns={columns} />
            </div>
        </div>
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
                    } else if (typeof value === 'string') {
                        valueEl = value;
                    } else if (typeof value === "object") {
                        valueEl = <NiceValue value={value} />;
                    } else if (typeof value === 'number') {
                        valueEl = value;
                    }
                }
                return valueEl;
            }
        }
    });

}

