import { observer, useObservable } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { columnDefs } from '..';
import reloadStructure from '../utils/reloadStructure';
import Form from './Form';
import Header from './Header';
import List from './List';
import reloadList from '../utils/reloadList';
import useAsyncEffect from 'use-async-effect';
import _ from 'lodash';

export default observer(({ parsed, mode, setMode, structure, auth, idKey }: any) => {
    const { table, form } = parsed;

    const meta = useObservable({
        list: [],
        filter: {
            columns: {},
            initDefault: false,
            form: {}
        },
        paging: {
            current: 0,
        },
        loading: false,
        form: {}
    });

    useAsyncEffect(async () => {
        reloadStructure({ idKey, structure });
        if (meta.list.length === 0) {
            meta.list = await reloadList({
                structure,
                idKey,
                filter: meta.filter,
                paging: meta.paging
            });
        }
    }, []);

    const colDef = {};
    _.get(columnDefs, `${structure.name}.columns`, []).map(e => {
        colDef[e.column_name] = e;
    })
    const fkeys = structure.fkeys;
    if (!colDef || !fkeys) return null;

    const reload = async () => {
        meta.list = await reloadList({
            structure,
            idKey,
            filter: meta.filter,
            paging: meta.paging
        });
    };

    return <div style={{ display: "flex", flexDirection: 'column', flex: 1 }}>
        <Header
            structure={structure}
            parsed={parsed}
            form={meta.form}
            mode={mode}
            auth={auth}
            idKey={idKey}
            reload={reload}
            setLoading={(v: boolean) => meta.loading = v}
            setMode={setMode} />
        {mode === ''
            ? <List
                table={table}
                setMode={setMode}
                list={meta.list}
                setForm={(v) => meta.form = v}
                filter={meta.filter}
                reload={reload}
                colDef={colDef}
                fkeys={fkeys} />
            : <Form form={form} data={meta.form} mode={mode} />
        }
    </div>;
})