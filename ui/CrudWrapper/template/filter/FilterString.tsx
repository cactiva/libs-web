import * as React from 'react';
import ItemButton from './ItemButton';
import { TextField } from '@fluentui/react/lib/TextField';
import { observer, useLocalStore } from 'mobx-react-lite';

export default observer(({ label, field, value, setValue, submit }: any) => {
    const meta = useLocalStore(() => ({
        oldval: value
    }))
    return <ItemButton
        label={label}
        field={field}
        setValue={setValue}
        onClear={submit}
        value={value}>
        <TextField
            value={meta.oldval}
            onChange={(e: any) => {
                meta.oldval = e.target.value;
            }}
            onKeyDown={(e: any) => {
                if (e.which === 13) {
                    meta.oldval = e.target.value;
                    setValue(e.target.value);
                    submit();
                }
            }}
            styles={{ root: { padding: 10 } }} />
    </ItemButton>;
})