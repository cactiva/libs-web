import { toJS } from 'mobx';
import { observer, useObservable } from 'mobx-react-lite';
import * as React from 'react';
import FormContainer from './form/FormContainer';
import { generateFormField } from './form/utils/generateFormField';

export default observer((props: any) => {
    const { structure, form, mode, colDef, auth, inmeta, formRef, generateForm } = props;
    const { errors, fkeys } = inmeta;
    const data = inmeta.form;
    const meta = useObservable({
        size: localStorage['cactiva-app-split-size'] || '200',
        resizing: false,
        fields: null as any,
        resizeTimer: 0 as any
    })

    React.useEffect(() => {
        if (typeof form === 'function' && !meta.fields) {
            const parsedForm = form(mode);
            meta.fields = generateFormField(parsedForm, structure, colDef, fkeys, auth, errors, meta, data, generateForm);
            if (inmeta.hasRelation === undefined) {
                inmeta.hasRelation = Object.keys(meta.fields.relations).length > 0
            }
        }
    }, []);
    
    if (!meta.fields || inmeta.hasRelation === undefined || typeof form !== 'function') return null;
    return <div style={{ flex: 1, position: 'relative' }}>
        <FormContainer
            formRef={formRef}
            data={data}
            auth={auth}
            mode={mode}
            fields={toJS(meta.fields)} />
    </div>;
});
