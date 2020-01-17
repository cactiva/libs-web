import * as React from 'react';
import { useObservable } from 'mobx-react-lite';
import ItemButton from './ItemButton';
import { TextField } from 'office-ui-fabric-react';

export default ({ label, field, value, setValue, submit }: any) => {
    const meta = useObservable({
        oldval: parseInt((value || '')).toLocaleString().replace(/,/ig, '.')
    })
    return <ItemButton
        label={label}
        field={field}
        setValue={setValue}
        onClose={() => {
            setValue(parseInt((meta.oldval || '').replace(/\./ig, '')));
            submit();
        }}
        value={value}>

        <TextField
            value={meta.oldval}
            onChange={(e: any) => {
                meta.oldval = parseInt((e.target.value || '').replace(/\./ig, '')).toLocaleString().replace(/,/ig, '.');
            }}
            onKeyDown={(e: any) => {
                if (e.which === 13) {
                    setValue(parseInt((meta.oldval || '').replace(/\./ig, '')));
                    submit();
                }
            }}
            styles={{ root: { padding: 15 } }}
        />

    </ItemButton>
}