import { observer, useObservable } from 'mobx-react-lite';
import * as React from 'react';
import SplitPane from 'react-split-pane';
import FormBody from './FormBody';
import SubForm from './SubForm';
import { toJS } from 'mobx';

export default observer(({ mode, fields, formRef, data, auth }: any) => {
    const meta = useObservable({
        size: localStorage['cactiva-app-split-size'] || '200',
        subs: {},
        resizing: false,
        resizeTimer: 0 as any
    })
    const rels = Object.keys(fields.relations);
    return (mode === 'create' || rels.length === 0)
        ? <FormBody data={data} fields={fields} formRef={formRef} />
        : <SplitPane
            split="horizontal"
            resizerStyle={{ borderTop: '3px double #ccc', cursor: 'row-resize', }}
            primary="second"
            onChange={size => {
                if (meta.resizeTimer) {
                    clearTimeout(meta.resizeTimer);
                }
                meta.resizing = true;
                meta.size = size.toString();
                meta.resizeTimer = setTimeout(() => {
                    meta.resizing = false
                    localStorage.setItem('cactiva-app-split-size', meta.size)
                }, 300);
            }}
            size={meta.size + "px"}>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, padding: 10, overflow: 'auto' }}>
                <FormBody data={data} fields={fields} formRef={formRef} />
            </div>
            <SubForm fields={fields} auth={auth} />
        </SplitPane>;
});