import * as React from 'react';
import { useLocalStore, observer } from 'mobx-react-lite';
import ItemButton from './ItemButton';
import { TextField } from '@fluentui/react/lib/TextField';

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
                meta.oldval = e.target.value.replace(/\D/g, '');
            }}
            onKeyDown={(e: any) => {
                if (e.which === 13) {
                    meta.oldval = e.target.value.replace(/\D/g, '');
                    setValue(e.target.value.replace(/\D/g, ''));
                    submit();
                }
            }}
            styles={{ root: { padding: 15 } }}
        />

    </ItemButton>
})