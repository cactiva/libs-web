import { toJS } from 'mobx';
import { observer, useObservable } from 'mobx-react-lite';
import * as React from 'react';
import FormContainer from './form/FormContainer';
import { generateFormField } from './form/utils/generateFormField';
import _ from 'lodash';

export default observer((props: any) => {
    const { structure, form, mode, colDef, auth, inmeta, parsed, formRef, generateForm } = props;
    const { errors, fkeys } = inmeta;
    const data = inmeta.form;
    const meta = useObservable({
        size: localStorage['cactiva-app-split-size'] || '200',
        resizing: false,
        fields: null as any,
        resizeTimer: 0 as any,
        events: {} as any
    })

    React.useEffect(() => {
        if (typeof form === 'function' && !meta.fields) {
            meta.events.data = data;
            meta.events.render = () => {
                const parsedForm = form(mode, meta.events);
                const afterLoad = _.get(meta, 'events.afterLoad');
                if (afterLoad) {
                    afterLoad(data);
                }


                meta.fields = generateFormField(parsedForm, structure, colDef, fkeys, auth, errors, meta, data, generateForm, meta.events.modifyColumns);
                
                if (inmeta.hasRelation === undefined) {
                    inmeta.hasRelation = Object.keys(meta.fields.relations).length > 0
                }
            };
            meta.events.render();
        }
    }, []);

    if (!meta.fields || inmeta.hasRelation === undefined || typeof form !== 'function') return null;
    return <div style={{ flex: 1, position: 'relative' }}>
        <FormContainer
            formRef={formRef}
            data={data}
            auth={auth}
            mode={mode}
            parsed={parsed}
            events={meta.events}
            fields={toJS(meta.fields)} />
    </div>;
});
