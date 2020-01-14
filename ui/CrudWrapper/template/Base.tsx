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

export default observer(({ parsed, mode, setMode, idKey, structure }: any) => {
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

    return <div style={{ display: "flex", flexDirection: 'column', flex: 1 }}>
        <Header parsed={parsed} mode={mode} setMode={setMode} />
        {mode === ''
            ? <List
                table={table}
                setMode={setMode}
                list={meta.list}
                filter={meta.filter}
                reload={async () => {
                    meta.list = await reloadList({
                        structure,
                        idKey,
                        filter: meta.filter,
                        paging: meta.paging
                    });
                }}
                colDef={colDef}
                fkeys={fkeys} />
            : <Form form={form} data={meta.form} mode={mode} />
        }
    </div>;
})