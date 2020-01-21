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
import { Spinner, Label, SpinnerSize } from 'office-ui-fabric-react';
import Loading from './Loading';


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
        loadingInitText: '',
        fkeys: structure.fkeys,
        form: {},
        listScroll: { top: 0, left: 0 },
        errors: {}
    });
    useAsyncEffect(async () => {
        meta.fkeys = await reloadStructure({
            idKey, structure, setLoading: (value) => {
                meta.loadingInitText = value;
            }
        });
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
    _.get(columnDefs, `${structure.name}`, []).map(e => {
        colDef[e.column_name] = e;
    })
    if (Object.keys(colDef).length === 0 || !meta.fkeys) {
        return <Loading text={meta.loadingInitText} />;
    }

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
        setErrors={v => meta.errors = v}
        errors={meta.errors}
        mode={mode}
        style={headerStyle}
        hasRelation={meta.hasRelation}
        auth={auth}
        idKey={idKey}
        colDef={colDef}
        reload={reload}
        setLoading={(v: boolean) => meta.loading = v}
        setMode={setMode} />;

    const scroll = meta.listScroll;
    const setScroll = (v) => { meta.listScroll = v; };
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
                scroll={scroll}
                setScroll={setScroll}
                fkeys={meta.fkeys} />
            : <Form
                form={form}
                colDef={colDef}
                parsed={parsed}
                structure={structure}
                fkeys={meta.fkeys}
                data={meta.form}
                errors={meta.errors}
                setHasRelation={(v) => meta.hasRelation = v}
                mode={mode} />
        }
    </div>;
})