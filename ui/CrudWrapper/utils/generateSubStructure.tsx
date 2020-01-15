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
    const tcols = (rel.column.props.table || fields).filter(t => { return t.name !== 'id' });
    const fcols = (rel.column.props.form || fields).filter(t => { return t.name !== 'id' });
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
            fkeys: {}
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
                row: {
                    children: tcols.map(t => {
                        return <TableColumn path={t.name} title={_.startCase(t.name)} />
                    })
                }, head: {
                    children: tcols.map(t => {
                        return <TableColumn path={t.name} title={_.startCase(t.name)} />
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