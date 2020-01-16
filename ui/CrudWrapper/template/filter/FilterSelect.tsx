import * as React from 'react';
import ItemButton from './ItemButton';
import { useObservable } from 'mobx-react-lite';
import { Select } from '@src/libs/ui';
import _ from 'lodash';

export default ((props: any) => {
    const { label, field, value, setValue, submit, items } = props;
    let valueLabel = _.get(_.find(items, { value }), "text");
    if (!valueLabel) {
        _.map(items, e => { if (e === value) valueLabel = e; })
    }

    return <ItemButton
        label={label}
        field={field}
        setValue={setValue}
        onClose={() => {
            submit()
        }}
        value={valueLabel}>
        <div style={{ padding: 10 }}>
            <Select items={items} selectedKey={value} onChange={(e, item) => {
                setValue(item.key);
                submit();
            }} />
        </div>
    </ItemButton>;
});