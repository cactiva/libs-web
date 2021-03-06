import { Select } from '@src/libs/ui';
import { queryAll } from '@src/libs/utils/gql';
import _ from "lodash";
import { observer, useLocalStore } from 'mobx-react-lite';
import * as React from 'react';
import useAsyncEffect from 'use-async-effect';
import ItemButton from './ItemButton';
import { observable, toJS } from 'mobx';
import { formatRelationLabel } from '../fields/SelectFk';

const relationDatas = observable({});
export default observer(({ label, field, value, setValue, submit, tablename, auth, alias, structure, relation }: any) => {
    const meta = useLocalStore(() => ({
        list: []
    }))
    useAsyncEffect(async () => {
        if (!relationDatas[tablename]) {
            let q = ``;
            if (relation.filter) {
                if (relation.filter.table) {
                    tablename = relation.filter.table;
                    q = `query {  ${tablename} { ${relation.filter.columns.join('\n')} }}`;
                } else if (relation.filter.query) {
                    q = relation.filter.query;
                }
            } else {
                let col = _.cloneDeep(_.find(structure.fields, { name: alias }));
                col.name = tablename;

                if (!_.find(col.fields, { name: 'id' })) {
                    col.fields.push({ name: 'id' });
                }

                q = `query { ${struct2gql(col)} }`;
            }
            const res = await queryAll(q, { auth });
            relationDatas[tablename] = res;
        }


        meta.list = relationDatas[tablename].map((e) => {
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
                    if (keys.length > 0) {
                        label = formatRelationLabel(keys, e);
                    }
                }
            }

            return {
                value: e['id'],
                label
            }
        })
    }, [])
    const valueLabel = _.get(_.find(meta.list, { value }), "label");
    return <ItemButton
        label={label}
        field={field}
        setValue={setValue}
        onClear={submit}
        onClose={() => {
            // submit()
        }}
        value={valueLabel}>
        <div style={{ padding: 10 }}>
            <Select items={meta.list} selectedKey={value} onChange={(e, item) => {
                if (item && item.key) {
                    setValue(item.key);
                    submit();
                }
            }} />
        </div>
    </ItemButton>
});

const struct2gql = (struct: any) => {
    let fields = [];

    if (struct.fields) {
        fields = struct.fields.map(e => struct2gql(e));
    }

    const sname = struct.originalName || struct.name;
    return `${sname} ${fields.length > 0 ? `{ ${fields.join('\n')}}` : ''}`;
}