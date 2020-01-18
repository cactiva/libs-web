import { Select } from '@src/libs/ui';
import api from '@src/libs/utils/api';
import { queryAll } from '@src/libs/utils/gql';
import { observable } from 'mobx';
import { observer, useObservable } from 'mobx-react-lite';
import * as React from 'react';
import useAsyncEffect from 'use-async-effect';
import { columnDefs } from '../..';

const relationDatas = observable({});
export default observer((props: any) => {
    const { tablename, labelField, auth, value, setValue } = props;
    const meta = useObservable({
        list: []
    })
    useAsyncEffect(async () => {
        if (!columnDefs[tablename]) {
            const res = await api({ url: `/api/db/columns?table=${tablename}` }) as any[];
            if (res) {
                columnDefs[tablename] = {
                    columns: res,
                    data: []
                };
            }
        }

        if (!relationDatas[tablename]) {
            const cols = columnDefs[tablename].columns;
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

        const list = relationDatas[tablename].map(e => {
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
                        label: keys.filter(f => f !== 'id').map(f => {
                            return e[f];
                        }).join(' • ')
                    }
                }
            }

            return {
                value: e['id'],
                label: e[lfield]
            };
        });
        meta.list = list;
    }, [])


    return <Select styles={props.styles} label={props.label} items={meta.list} selectedKey={value} onChange={(e, item) => {
        setValue(item.key);
    }} />
})