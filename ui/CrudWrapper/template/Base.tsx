import _ from 'lodash';
import { observer, useObservable } from 'mobx-react-lite';
import React from 'react';
import useAsyncEffect from 'use-async-effect';
import { columnDefs } from '..';
import reloadList from '../utils/reloadList';
import reloadStructure from '../utils/reloadStructure';
import Form from './Form';
import Header from './Header';
import List from './List';
import { toJS } from 'mobx';


export default observer(({ parsed, mode, setMode, structure, auth, idKey, renderHeader, style, headerStyle }: any) => {
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
        hasRelation: false,
        fkeys: structure.fkeys,
        form: {}
    });
    useAsyncEffect(async () => {
        meta.fkeys = await reloadStructure({ idKey, structure });
        if (meta.list && meta.list.length === 0) {
            meta.list = await reloadList({
                structure,
                idKey,
                filter: meta.filter,
                paging: meta.paging
            });
        }
    }, [structure]);

    const colDef = {};
    _.get(columnDefs, `${structure.name}.columns`, []).map(e => {
        colDef[e.column_name] = e;
    })
    if (Object.keys(colDef).length === 0 || !meta.fkeys) return null;

    const reload = async () => {
        meta.list = await reloadList({
            structure,
            idKey,
            filter: meta.filter,
            paging: meta.paging
        });
    };


    const header = <Header
        structure={structure}
        parsed={parsed}
        form={meta.form}
        setForm={v => meta.form = v}
        mode={mode}
        style={headerStyle}
        hasRelation={meta.hasRelation}
        auth={auth}
        idKey={idKey}
        reload={reload}
        setLoading={(v: boolean) => meta.loading = v}
        setMode={setMode} />;

    return <div style={{ display: "flex", flexDirection: 'column', flex: 1, ...style }}>
        {renderHeader
            ? renderHeader({
                header,
            })
            : header}
        {mode === ''
            ? <List
                table={table}
                setMode={setMode}
                structure={structure}
                list={meta.list}
                setForm={(v) => meta.form = v}
                filter={meta.filter}
                reload={reload}
                auth={auth}
                colDef={colDef}
                fkeys={meta.fkeys} />
            : <Form
                form={form}
                colDef={colDef}
                parsed={parsed}
                structure={structure}
                fkeys={meta.fkeys}
                data={meta.form}
                setHasRelation={(v) => meta.hasRelation = v}
                mode={mode} />
        }
    </div>;
})