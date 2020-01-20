import { dateFormat } from '@src/libs/utils/date';
import _ from 'lodash';
import { ColumnActionsMode, DetailsList, DetailsListLayoutMode, IDetailsHeaderProps, IDetailsRowProps, IRenderFunction, SelectionMode, Spinner } from 'office-ui-fabric-react';
import * as React from 'react';
import NiceValue from '../../Field/NiceValue';
import Filter from './filter';
import { formatMoney } from '@src/libs/utils';

export default ({ table, reload, setForm, list, auth, filter, colDef, fkeys, setMode, structure }: any) => {
    if (Object.keys(colDef).length === 0) return <div style={{ width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
    </div>;

    const columns = generateColumns(structure, table, colDef, fkeys);
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

const generateColumns = (structure, table, colDef, fkeys) => {
    const keys = {};
    _.forEach(table.head.children, e => {
        keys[e.props.path] = e;
    });
    const hidden: any = [];
    const cols = table.head.children.map((e, idx) => {
        let relation: any = undefined;
        if (e.props.relation) {
            relation = e.props.relation;
        } else if (!e.props.relation && fkeys) {
            const fk = fkeys[e.props.path];
            if (fk && fk.table_name === structure.name) {
                const tablename = fk.foreign_table_name;
                const key: any = keys[tablename] || keys[tablename + 's'];
                if (key) {
                    hidden.push(key.props.path);
                    relation = {
                        alias: key.props.path
                    }
                }
            }
        }

        let title = e.props.title;
        if (title && title.toLowerCase().indexOf('id') === 0) title = title.substr(3);

        return {
            ...e.props,
            title,
            relation,
            children: _.get(table, `row.children.${idx}.props.children`)
        }
    }).filter(e => !!e && hidden.indexOf(e.path) < 0);

    return cols.map((e: any) => {
        const fk = fkeys[e.path];
        let relation = e.relation;
        if (fk && !relation) {
            relation = {
                from: {
                    table: fk.foreign_table_name
                }
            }
        }
        return {
            key: e.path,
            name: e.title,
            relation: relation,
            filter: e.filter,
            maxWidth: 200,
            columnActionsMode: ColumnActionsMode.disabled,
            onRender: (item: any) => {
                const cdef = colDef[e.path];
                const value = _.get(item, e.path);
                let valueEl: any = null;
                if (e.relation) {
                    const alias = e.relation.alias;
                    if (typeof e.relation.label === 'function') {
                        valueEl = formatValue(e.relation.label(item));
                    } else if (alias) {
                        valueEl = formatValue(item[alias]);
                    }
                } else if (cdef) {
                    if (cdef.data_type.indexOf('numeric') >= 0) {
                        valueEl = formatMoney(value);
                    } else if (cdef.data_type.indexOf('timestamp') >= 0 || cdef.data_type === 'date') {
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
