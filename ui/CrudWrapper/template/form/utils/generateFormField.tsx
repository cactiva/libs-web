import _ from 'lodash';
import * as React from 'react';
import { DateTime, Field, Input } from '../../../..';
import DateField from '../../../../DateField';
import generateSubStructure from './generateSubStructure';
import SelectFk from '../../fields/SelectFk';

export const generateFormField = (parsedForm: any, structure, colDef, fkeys, auth, errors, meta, data) => {
    const relations = {};
    const hidden: any = [];

    const keys = {};
    let columns = _.cloneDeep(_.get(parsedForm, "props.children", []));
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

    const indexed = {};
    columns = columns.filter(e => {
        let fk: any = null;
        if (indexed[e.props.path]) return false;
        indexed[e.props.path] = true;
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
                    options: e.props.options
                };
                relations[e.props.path].sub = generateSubStructure(relations[e.props.path], structure, data)
                return false;
            } else if (!fk.table_schema) {
                relations[e.props.path] = {
                    path: e.props.path,
                    column: e,
                    fkey: fk,
                    options: e.props.options
                };
                relations[e.props.path].sub = generateSubStructure(relations[e.props.path], structure, data)
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
                        labelField={e.props.labelField}
                        relation={e.props.relation}
                        auth={auth}
                        styles={{
                            container: {
                                width: '32%',
                                marginRight: '10px'
                            }
                        }}
                    />
                }
            } else {
                switch (type) {
                    case "integer":
                        children = <Input type="number" />;
                        break;
                    case "numeric": // money
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
                    default:
                        children = <Input type="text" />;
                }
            }
        }

        const required = _.get(cdef, 'is_nullable', 'YES') === 'NO' && !_.get(cdef, 'column_default', null);
        return {
            children,
            props: {
                ...e.props,
                required,
                errorMessage: errors[e.props.path],
                label,
                style: e.props.style,
                styles: {
                    root: {
                        width: '32%',
                        marginRight: '10px'
                    }
                }
            }
        };
    });

    return { columns, relations };
}