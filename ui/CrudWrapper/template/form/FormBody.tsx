import _ from 'lodash';
import { toJS } from 'mobx';
import { observer, useObservable } from 'mobx-react-lite';
import * as React from 'react';
export default observer(({ data, fields, formRef }: any) => {
    const meta = useObservable({ data: toJS(data) });
    formRef.current = meta.data;
    return <div
        style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {fields.columns.map((e, idx) => {
            const Field = e.children.type;
            return <Field
                {...e.props}
                {...e.children.props}
                value={_.get(meta.data, e.props.path)}
                onChange={(v) => {
                    const value = _.get(v, 'target.value', v);
                    _.set(meta.data, e.props.path, value);
                }}
                key={idx}
            />;
        })}
    </div>
});