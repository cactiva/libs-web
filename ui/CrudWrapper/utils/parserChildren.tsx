import _ from 'lodash';
import * as React from 'react';
import { columnDefs } from '..';
import { Text, View } from '../..';
import Table from '../../Table';
import TableHead from '../../Table/TableHead';
import TableRow from '../../Table/TableRow';
import { startCase } from '@src/libs/utils';

export default (input: any) => {
    const { children, idKey, data, relations } = input;
    const structure = data.structure;
    const output = {
        title: null as any,
        actions: null as any,
        table: {
            row: null as any,
            head: null as any,
            root: {
                config: null as any
            },
        },
        form: null as any
    };
    const castedIdKey = startCase(idKey);
    const colDef = _.get(columnDefs, `${(structure || {}).name}`)
    children.map((e) => {
        if (e.type === Table) {
            output.table.root = { ...e.props };
            if (structure && structure.orderBy.length > 0) {
                output.table.root.config = {
                    sortMode: _.get(structure, 'orderBy.0.value'),
                    sortField: _.get(structure, 'orderBy.0.name'),
                }
            }

            _.castArray(e.props.children).map(c => {
                if (c.type === TableRow) {
                    output.table.row = {
                        ...c.props, children: _.castArray(c.props.children)
                            .filter(r => {
                                return r.props.path !== idKey;
                            })
                            .map((r, rk) => {
                                let fk: any = null;

                                if (colDef) {
                                    const col = _.find(colDef, { column_name: r.props.path });
                                    if (col) {
                                        if (col.data_type === 'numeric') {
                                            return {
                                                ...r, props: {
                                                    ...r.props,
                                                    children: (c, params) => {
                                                        return <Text>{c.toLocaleString().replace(/,/ig, '.')}</Text>
                                                    }
                                                }
                                            };
                                        }
                                    }
                                }
                                return r;
                            })
                    };
                } else if (c.type === TableHead) {
                    output.table.head = {
                        ...c.props, children: _.castArray(c.props.children).filter(r => {
                            return r.props.title !== castedIdKey;
                        })
                    };
                }
            })
        } else if (e.type === Text) {
            output.title = { ...e.props };
        } else if (e.props && (e.type === View)) {
            if (!e.props.type) {
                output.actions = { ...e.props };
            }
        } else {
            output.form = e;
        }
    })

    return output;
}