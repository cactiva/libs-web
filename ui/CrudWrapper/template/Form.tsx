import _ from 'lodash';
import { observer, useObservable } from 'mobx-react-lite';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import * as React from 'react';
import SplitPane from 'react-split-pane';
import { DateTime, Field, Input } from '../..';
import DateField from '../../DateField';
import Form from '../../Form';
import generateSubStructure from '../utils/generateSubStructure';
import Base from './Base';
import SelectFk from './fields/SelectFk';
import { toJS } from 'mobx';

export default observer(({ structure, errors, form, data, mode, colDef, auth, parsed, fkeys, setHasRelation }: any) => {
    const meta = useObservable({
        size: localStorage['cactiva-app-split-size'] || '200',
        subs: {}
    })

    if (typeof form !== 'function') return null;

    const parsedForm = form(mode);
    const fields = processFields(parsedForm, structure, colDef, fkeys, auth, errors, meta, data);

    const relationKeys = Object.keys(fields.relations);
    if (setHasRelation) {
        setHasRelation(relationKeys.length > 0)
    }

    const formEl = <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, padding: 10, overflow: 'auto' }}>
        <Form data={data} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {fields.columns.map((e, idx) => {
                return <Field key={idx} {...e.props}
                    styles={{
                        root: {
                            width: '32%',
                            marginRight: '10px'
                        }
                    }} />;
            })}
        </Form>
    </div>;
    return <div style={{ flex: 1, position: 'relative' }}>
        {(mode === 'create' || relationKeys.length === 0) ? formEl :
            <SplitPane
                split="horizontal"
                resizerStyle={{ borderTop: '3px double #ccc', cursor: 'row-resize', }}
                primary="second"
                onChange={size => {
                    meta.size = size.toString();
                    localStorage.setItem('cactiva-app-split-size', size.toString())
                }}
                size={meta.size + "px"}>
                {formEl}
                <Pivot
                    className="base-form-sub"
                    styles={{ itemContainer: { flex: 1, display: 'flex' }, }}
                    style={{ display: 'flex', flex: 1, flexDirection: 'row', borderRight: '1px solid #ececeb', alignItems: 'stretch' }}>
                    {
                        relationKeys.map((e, key) => {
                            const rel = fields.relations[e];
                            const sub: any = rel.sub;
                            if (!sub || (sub && !sub.parsed)) return null;
                            return <PivotItem key={e}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                headerText={rel.column.props.label}
                                headerButtonProps={{
                                    'data-order': key,
                                    'data-title': rel.column.props.label
                                }}
                            >
                                <Base
                                    structure={sub.structure}
                                    auth={auth}
                                    parsed={{ ...sub.parsed, title: { children: sub.mode === '' ? '' : sub.parsed.title.children } }}
                                    mode={sub.mode}
                                    style={{ flexDirection: sub.mode === '' ? 'column' : 'row' }}
                                    headerStyle={sub.mode === '' ? {
                                        position: 'absolute',
                                        right: 10,
                                        top: -5
                                    } : { flexDirection: 'column', height: '100%', justifyContent: 'flex-start' }}
                                    setMode={sub.setMode}
                                />
                            </PivotItem>
                        })
                    }
                </Pivot>
            </SplitPane>
        }
    </div >;
});

const processFields = (parsedForm: any, structure, colDef, fkeys, auth, errors, meta, data) => {
    const relations = {};
    const hidden: any = [];

    const keys = {};
    let columns = _.get(parsedForm, 'props.children', []);
    if (!Array.isArray(columns)) {
        columns = [columns];
    }
    columns.forEach(e => {
        keys[e.props.path] = e;
    })
    const ovrd = structure.overrideForm || {};
    _.map(colDef, (e, k) => {
        if (e.is_nullable === 'NO' && !e.column_default && k !== 'id' && !ovrd[k]) {
            const col = _.find(columns, { props: { path: k } });
            if (!col) {
                let label = _.startCase(k);
                if (label.indexOf('Id') === 0) label = label.substr(3);
                columns.push(<Field path={k} label={label}><Input /></Field>)
            }
        }
    })

    const sub1 = (str) => {
        return str.substr(0, str.length - 1);
    }

    columns = columns.filter(e => {
        let fk: any = null;
        if (e.props.path.indexOf('.') > 0) {
            const eks = e.props.path.split('.');
            let found: any = null;
            let i: any = 0;
            for (i in eks) {
                const tname = eks[i];
                if (i * 1 === 0) {
                    found = _.find(fkeys, { foreign_table_name: tname });
                    if (!found) {
                        found = _.find(fkeys, { foreign_table_name: sub1(tname) });
                    }
                } else {
                    let tfound = _.find(found, { table_name: tname });
                    if (!tfound) {
                        tfound = _.find(found, { table_name: sub1(tname) });
                    }
                    if (tfound)
                        found = tfound;
                }

                if (found && found.columns) {
                    found = found.columns;
                }
            }
            if (found) {
                fk = found;
            }
        } else {
            fk = fkeys[e.props.path];
            if (!fk) fk = fkeys[sub1(e.props.path)];
        }

        if (fk) {
            if (e.props.path.indexOf('.') > 0) {
                relations[e.props.path] = {
                    path: e.props.path,
                    column: e,
                    fkey: fk,
                };
                relations[e.props.path].sub = generateSubStructure(meta.subs, relations[e.props.path], structure, data)
                return false;
            } else if (!fk.table_schema) {
                relations[e.props.path] = {
                    path: e.props.path,
                    column: e,
                    fkey: fk
                };
                relations[e.props.path].sub = generateSubStructure(meta.subs, relations[e.props.path], structure, data)
                return false;
            } else {
                if (fk && fk.table_name === structure.name) {
                    const tablename = fk.foreign_table_name;
                    const key: any = keys[tablename] || keys[tablename + 's'];
                    if (key) {
                        hidden.push(key.props.path);
                    }
                }
            }
        }
        return true;
    }).filter(e => !!e && hidden.indexOf(e.props.path) < 0).map(e => {
        const path = e.props.path;
        const cdef = colDef[path];
        const fk = fkeys[path];
        let label = e.props.label;
        let children = e.props.children;
        if (label.indexOf('Id') === 0) {
            label = e.props.label.substr(3);
        }

        if (cdef || fk) {
            const type = cdef.data_type;
            if (fk) {
                const tablename = fk.foreign_table_name;
                if (tablename) {
                    children = <SelectFk
                        tablename={tablename}
                        labelField={e.props.labelOptions}
                        relation={e.props.relation}
                        auth={auth}
                        label={label}
                        styles={{
                            container: {
                                width: '32%',
                                marginRight: '10px'
                            }
                        }} />
                }
            } else {
                switch (type) {
                    case "integer":
                        children = <Input type="number" />;
                        break;
                    case "numeric": // money
                        children = <Input type="money" />;
                        break;
                    case "double precision":
                    case "decimal":
                        children = <Input type="money" />;
                        break;
                    case "timestamp without time zone":
                    case "timestamp with time zone":
                        children = <DateTime />;
                        break;
                    case "date":
                        children = <DateField />
                        break;
                }
            }
        }

        const required = _.get(cdef, 'is_nullable', 'YES') === 'NO' && !_.get(cdef, 'column_default', null);
        return {
            props: {
                ...e.props,
                required,
                errorMessage: errors[e.props.path],
                label,
                children
            }
        };
    });

    return { columns, relations };
}