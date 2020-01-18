import _ from 'lodash';
import React from 'react';
import { TableColumn, Field, Input, Button } from '../..';
import Form from '../../Form';

export default (metasub, rel, structure, parsed, data) => {
    if (!rel.fkey || !rel.path) return null;
    const relfk = rel.fkey[_.keys(rel.fkey)[0]];

    if (!metasub[rel.path]) {
        metasub[rel.path] = {
            mode: ''
        }
    }

    const id = data[relfk.foreign_column_name];
    const fields = _.get(_.find(_.get(structure, `fields`, []), { name: rel.path }), 'fields', []);
    const table = _.get(rel, 'column.props.table', {});
    let tcols = (fields).filter(t => {
        if (Array.isArray(table.hide) && table.hide.indexOf(t.name) >= 0) return false;
        return t.name !== 'id'
    });
    if (table.options) {
        tcols = tcols.map(t => {
            if (table.options[t.name]) {
                return {
                    ...t,
                    ...table.options[t.name]
                }
            }
            return t;
        })
    }



    const fcols = (rel.column.props.form || fields).filter(t => { return t.name !== 'id' });
    const defaultForm = _.get(rel, 'column.props.options.default');
    return {
        structure: {
            name: relfk.table_name,
            fields: fields,
            where: [{
                name: relfk.column_name,
                operator: '_eq',
                value: id,
                valueType: 'IntValue'
            }],
            orderBy: [],
            options: {},
            fkeys: undefined,
            overrideForm: {
                ...defaultForm,
                [relfk.column_name]: id
            }
        },
        parsed: {
            title: { children: rel.column.props.label },
            actions: {
                children: [
                    <Button type='create' />,
                    <Button type='save' />,
                    <Button type='delete' />,
                    <Button type='cancel' />,
                ]
            },
            table: {
                head: {
                    children: tcols.map(t => {
                        let name = t.name;
                        return <TableColumn
                            path={t.name}
                            title={_.startCase(name)}
                            relation={t.relation} />
                    })
                }, row: {
                    children: tcols.map(t => {
                        return <TableColumn path={t.name} />
                    })
                }, root: {
                    children: []
                }
            },
            form: (mode) => {
                return <Form>{
                    fcols.map((e, idx) => {
                        return <Field key={idx} path={e.name} label={_.startCase(e.name)}
                            styles={{
                                root: {
                                    width: '32%',
                                    marginRight: '10px'
                                }
                            }}>
                            <Input />
                        </Field>;
                    })}</Form>
            }
        },
        mode: metasub[rel.path].mode,
        setMode: (newmode) => metasub[rel.path].mode = newmode
    }

}