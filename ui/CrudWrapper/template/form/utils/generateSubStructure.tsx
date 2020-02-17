import _ from 'lodash';
import React from 'react';
import { TableColumn, Field, Input, Button } from '../../../..';
import Form from '../../../../Form';
import { toJS } from 'mobx';
import { startCase } from '@src/libs/utils';

export default (rel, structure, data) => {
    if (!rel.fkey || !rel.path) return null;
    let idata = data;
    let istructure = structure;
    let relfk = rel.fkey[_.keys(rel.fkey)[0]];
    let relpath = rel.path;
    if (rel.path.indexOf('.') > 0) {
        relfk = rel.fkey;
        const rsplit = relpath.split('.');
        relpath = rsplit.pop();
        idata = _.get(data, rsplit.join('.'));
        let tstruct = structure.fields;
        for (let name of rsplit) {
            const found = _.find(tstruct, { name });
            if (found) {
                tstruct = found;
            }
        }
        if (!Array.isArray(tstruct)) {
            istructure = tstruct;
        }
    }

    const options = _.get(rel, 'options', {});
    const id = idata[relfk.foreign_column_name];
    const fields = _.get(_.find(_.get(istructure, `fields`, []), { name: relpath }), 'fields', []);
    const table = options.table || {};
    let tcols = (fields).filter(t => {
        if (Array.isArray(table.removeColumns) && table.removeColumns.indexOf(t.name) >= 0) return false;
        return t.name !== 'id'
    });

    if (Array.isArray(table.addColumns)) {
        table.addColumns.forEach(r => {
            const col = {
                name: r.path,
                title: r.title,
                children: r.children
            }

            const pos = r.position || 'last';
            if (pos === 'first') {
                tcols.unshift(col);
            } else if (pos === 'last') {
                tcols.push(col);
            } else if (typeof pos === 'number') {
                tcols.splice(pos, 0, col);
            }
        })
    }

    if (typeof table.modifyColumns === 'function') {
        tcols = table.modifyColumns(tcols.map(e => ({
            ...toJS(e),
            title: startCase(e.name)
        })));
    }

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

    if (!_.find(fields, { name: 'id' })) {
        fields.push({ name: 'id' });
    }

    const afterLoad = _.get(rel, 'column.props.options.form.afterLoad');
    const afterSubmit = _.get(rel, 'column.props.options.form.afterSubmit');
    const beforeSubmit = _.get(rel, 'column.props.options.form.beforeSubmit');


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
            },
        },
        parsed: {
            title: { children: rel.column.props.label },
            actions: {
                children: _.get(options, 'actions', [
                    <Button type='create' />,
                    <Button type='save' />,
                    <Button type='delete' />,
                    <Button type='cancel' />,
                ])
            },
            table: {
                head: {
                    children: tcols.map(t => {
                        let name = t.name;
                        return <TableColumn
                            path={t.name}
                            suffix={t.suffix}
                            prefix={t.prefix}
                            title={t.title || startCase(name)}
                            children={t.children}
                            relation={t.relation} />
                    })
                }, root: {
                    children: []
                }
            },
            form: (mode, events) => {
                if (afterLoad) events.afterLoad = afterLoad
                if (beforeSubmit) events.beforeSubmit = beforeSubmit
                if (afterSubmit) events.afterSubmit = afterSubmit

                if (rel.children && rel.children.type.type === (Form as any).type) {
                    return rel.children;
                }

                return <Form>{
                    fcols.map((e, idx) => {
                        let label = startCase(e.name)
                        if (label.indexOf('id ') === 0) label = label.substr(3);
                        return <Field
                            key={idx}
                            path={e.name}
                            label={label}
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
    }

}