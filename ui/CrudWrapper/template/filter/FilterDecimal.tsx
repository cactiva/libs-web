import * as React from 'react';
import ItemButton from './ItemButton';
import { observer, useObservable } from 'mobx-react-lite';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

export default observer (({ label, value, field, setValue, submit }: any) => {
    const meta = useObservable({
        oldval: (!!value ? value : '').toString()
    })
    return <ItemButton
        label = {label}
        field = {field}
        setValue={setValue}
        onClose= {() => {
            setValue(parseFloat(meta.oldval));
            submit()
        }}
        value= {value}>
        <TextField
            value= {meta.oldval}
            onChange= {(e: any) => {
                meta.oldval = setValue(parseFloat(e.target.value));
            }}
            onKeyDown={(e: any) => {
                if (e.which === 13){
                    meta.oldval = e.target.value;
                    setValue(parseFloat(e.target.value));
                    submit();
                }
            }}
            styles= {{root: {padding: 15}}}
        />
        </ItemButton>;
})