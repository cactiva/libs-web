import * as React from 'react';
import { useObservable, observer } from 'mobx-react-lite';
import ItemButton from './ItemButton';
import { TextField } from 'office-ui-fabric-react';

export default observer(({ label, field, value, setValue, submit }: any) => {
    const meta = useObservable({
        oldval: (parseInt(value || '') || '').toLocaleString().replace(/,/ig, '.') as any
    })
    return <ItemButton
        label={label}
        field={field}
        setValue={setValue}
        onClose={() => {
            setValue(parseInt((meta.oldval || '').replace(/\./ig, '')));
            submit();
        }}
        value={(parseInt(value || '') || '').toLocaleString().replace(/,/ig, '.')}>

        <TextField
            value={meta.oldval}
            onChange={(e: any) => {
                meta.oldval = parseInt((e.target.value || '').replace(/\./ig, '')).toLocaleString().replace(/,/ig, '.');
                if (meta.oldval === 'NaN') {
                    meta.oldval = '';
                }
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
});