import { dateFormat } from '@src/libs/utils/date';
import _ from 'lodash';
import { ColumnActionsMode, DetailsList, DetailsListLayoutMode, IDetailsRowProps, IRenderFunction, SelectionMode, IDetailsHeaderProps } from 'office-ui-fabric-react';
import * as React from 'react';
import NiceValue from '../../Field/NiceValue';
import Filter from './filter';
import { toJS } from 'mobx';

export default ({ table, reload, setForm, list, auth, filter, colDef, fkeys, setMode, structure }: any) => {
    if (Object.keys(colDef).length === 0) return null;

    const columns = generateColumns(table, colDef, fkeys);
    return <>
        <Filter
            filter={filter}
            reload={reload}
            columns={columns}
            structure={structure}
            auth={auth}
            colDef={colDef}
            fkeys={fkeys} />
        <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
            <div className="base-list">
                <DetailsList
                    selectionMode={SelectionMode.single}
                    items={list || []}
                    onItemInvoked={(e) => {
                        setForm(e);
                        setMode('edit');
                    }}
                    onRenderDetailsHeader={(detailsHeaderProps?: IDetailsHeaderProps, defaultRender?: IRenderFunction<IDetailsHeaderProps>) => {
                        return (
                            defaultRender ? defaultRender(detailsHeaderProps) : <div></div>
                        )
                    }}
                    onRenderRow={(detailsRowProps?: IDetailsRowProps, defaultRender?: IRenderFunction<IDetailsRowProps>) => (
                        <>
                            <div onClick={() => {
                                if (detailsRowProps) {
                                    setForm(detailsRowProps.item);
                                    setMode('edit');
                                }
                            }}>
                                {defaultRender && defaultRender(detailsRowProps)}
                            </div>
                        </>
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
            relation: e.relation,
            filter: e.filter,
            maxWidth: 200,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: any) => {
                const cdef = colDef[e.path];
                const value = _.get(item, e.path);
                let valueEl: any = null;
                if (e.relation && e.relation.alias) {
                    const alias = e.relation.alias;
                    if (typeof e.relation.label === 'function') {
                        valueEl = formatValue(e.relation.label(item));
                    } else {
                        valueEl = formatValue(item[alias]);
                    }
                } else if (cdef) {
                    if (cdef.data_type.indexOf('timestamp') >= 0 || cdef.data_type === 'date') {
                        valueEl = dateFormat(value);
                    } else {
                        valueEl = formatValue(value);
                    }
                }
                return valueEl;
            }
        }
    });

}


const formatValue = (value) => {
    if (typeof value === 'string') {
        return value;
    } else if (typeof value === "object") {
        return <NiceValue value={value} />;
    } else if (typeof value === 'number') {
        return value;
    }
}
