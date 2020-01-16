import { Select } from '@src/libs/ui';
import { queryAll } from '@src/libs/utils/gql';
import _ from "lodash";
import { observer, useObservable } from 'mobx-react-lite';
import * as React from 'react';
import useAsyncEffect from 'use-async-effect';
import ItemButton from './ItemButton';
import { relationDatas } from '../Base';

export default observer(({ label, field, value, setValue, submit, tablename, auth, alias, structure, relation }: any) => {
    const meta = useObservable({
        list: []
    })
    useAsyncEffect(async () => {
        if (!relationDatas[tablename]) {
            let q = ``;
            if (relation.filter) {
                if (relation.filter.table) {
                    tablename = relation.filter.table;
                    q = `${tablename} { ${relation.filter.columns.join('\n')} }`;
                } else if (relation.filter.query) {
                    q = relation.filter.query;
                }
            } else {
                let col = _.cloneDeep(_.find(structure.fields, { name: alias }));
                col.name = tablename;

                if (!_.find(col.fields, { name: 'id' })) {
                    col.fields.push({ name: 'id' });
                }

                q = struct2gql(col);
            }
            const res = await queryAll(`query { ${q} }`, { auth });

            meta.list = res.map((e) => {
                let label = '';
                let labelFunc = relation.label;

                if (relation.filter) {
                    labelFunc = relation.filter.label;
                    label = labelFunc(e);
                } else {
                    if (typeof labelFunc === 'function') {
                        label = labelFunc({ [alias]: e });
                    } else {
                        const keys = Object.keys(e);
                        label = e[keys[0]];
                    }
                }

                return {
                    value: e['id'],
                    label
                }
            })
        }
    }, [])

    const valueLabel = _.get(_.find(meta.list, { value }), "label");
    return <ItemButton
        label={label}
        field={field}
        setValue={setValue}
        onClose={() => {
            submit()
        }}
        value={valueLabel}>
        <div style={{ padding: 10 }}>
            <Select items={meta.list} selectedKey={value} onChange={(e, item) => {
                setValue(item.key);
                submit();
            }} />
        </div>
    </ItemButton>
});

const struct2gql = (struct: any) => {
    let fields = [];

    if (struct.fields) {
        fields = struct.fields.map(e => struct2gql(e));
    }

    return `${struct.name} ${fields.length > 0 ? `{ ${fields.join('\n')}}` : ''}`;
}