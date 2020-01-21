import { Select } from '@src/libs/ui';
import api from '@src/libs/utils/api';
import { queryAll } from '@src/libs/utils/gql';
import { observable, toJS } from 'mobx';
import { observer, useObservable } from 'mobx-react-lite';
import * as React from 'react';
import useAsyncEffect from 'use-async-effect';
import { columnDefs } from '../..';
import _ from 'lodash';

const relationDatas = observable({});
export default observer((props: any) => {
    const { tablename, labelField, auth, value, setValue, label, relation } = props;
    const meta = useObservable({
        list: []
    })
    useAsyncEffect(async () => {
        let rawList: any = [];
        if (relation && relation.query) {
            rawList = await queryAll(relation.query, { auth });
        } else {
            if (!columnDefs[tablename]) {
                const res = await api({ url: `/api/db/columns?table=${tablename}` }) as any[];
                if (res) {
                    columnDefs[tablename] = res;
                }
            }

            if (!relationDatas[tablename]) {
                const cols = columnDefs[tablename];
                let q = ` ${tablename} {
                    id
                    ${cols
                        .map(e => e.column_name)
                        .filter(e => e != 'id' && e.indexOf('id') !== 0)
                        .join('\n')}
                }`;
                const res = await queryAll(`query { ${q} }`, { auth });
                relationDatas[tablename] = res;
            }
            rawList = relationDatas[tablename];
        }

        const list = rawList.map(e => {
            if (relation && relation.label) {
                if (typeof relation.label === 'function') {
                    return {
                        value: relation.id ? e[relation.id] : e['id'],
                        label: relation.label(e)
                    };
                } else {
                    return {
                        value: relation.id ? e[relation.id] : e['id'],
                        label: _.get(e, relation.label)
                    };
                }
            } else {
                const keys = Object.keys(e);

                let lfield = '';
                if (typeof labelField === 'string') {
                    lfield = labelField;
                } else if (typeof labelField === 'function') {
                    lfield = labelField(e);
                } else {
                    if (keys.length > 0) {
                        return {
                            value: e['id'],
                            label: formatRelationLabel(keys, e)
                        }
                    }
                }

                return {
                    value: e['id'],
                    label: e[lfield]
                };
            }
        });
        meta.list = list;
    }, [])


    return <Select
        styles={props.styles}
        label={props.label}
        errorMessage={props.errorMessage}
        required={props.required}
        items={meta.list}
        selectedKey={value}
        onChange={(e, item) => {
            setValue(item && item.key);
        }} />
})

export const formatRelationLabel = (keys, e) => {
    let usedKeys = keys;

    if (keys.length > 2) {
        usedKeys = keys.filter(f => {
            if (f.indexOf('name') >= 0) {
                return true;
            }
            return false;
        })
    } else {
        if (usedKeys.length === 0) {
            usedKeys.push(keys[0]);
            usedKeys.push(keys[1]);
        }
    }

    return usedKeys.filter(f => f !== 'id').map(f => {
        return e[f];
    }).join(' • ');
}