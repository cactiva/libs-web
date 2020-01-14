import * as React from 'react';
import ItemButton from './ItemButton';
import { observer, useObservable } from 'mobx-react-lite';
import { DateTime } from '@src/libs/ui';
import { dateFormat } from '@src/libs/utils/date';

export default observer(({ label, field, value, setValue, submit }: any) => {
    return <ItemButton
        label={label}
        field={field}
        setValue={setValue}
        onClose={() => submit()}
        value={value instanceof Date ? dateFormat(value) : ""}>
        <DateTime
            value={value}
            onChange={(e: any) => {
                setValue(e);
            }}
            styles={{ root: { padding: 10 } }} />
    </ItemButton>;
})