import _ from 'lodash';
import { toJS } from 'mobx';
import { observer, useObservable } from 'mobx-react-lite';
import * as React from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
export default observer(({ data, errors, fields, formRef }: any) => {
    const meta = useObservable({
        data: toJS(data),
        errors: toJS(errors) || {}
    });
    const errorLen = Object.keys(meta.errors).length;
    formRef.current = meta;
    return <>

        {errorLen > 0 && <div style={{ flex: 1, width: '100%', marginBottom: 20 }}>
            <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
                Save Failed. Please fix {errorLen} error bellow:
        </MessageBar>
        </div>
        }
        <div
            style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>

            {fields.columns.map((e, idx) => {
                const Field = e.children.type;
                return <Field
                    {...e.props}
                    {...e.children.props}
                    value={_.get(meta.data, e.props.path)}
                    errorMessage={meta.errors[e.props.path]}
                    onChange={(v) => {
                        const value = _.get(v, 'target.value', v);
                        _.set(meta.data, e.props.path, value);
                    }}
                    key={idx}
                />;
            })}
        </div>
    </>
});