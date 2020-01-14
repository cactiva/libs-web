import * as React from 'react';
import { useObservable } from 'mobx-react-lite';
import ItemButton from './ItemButton';
import { TextField } from 'office-ui-fabric-react';

export default ({ label, field, value, setValue, submit }: any) => {
    const meta = useObservable({
        oldval: value
    })
    return <ItemButton
        label={label}
        field={field}
        onClose={() => submit()}
        value={value}>
            
            <TextField
                value={meta.oldval}
                onChange={(e: any) => {
                    console.log('yguu')
                    meta.oldval = e.target.value.replace(/\D{3}/g,'');
                }}
                onKeyDown={(e: any) => {
                    if (e.which === 13){
                        meta.oldval = e.target.value.replace(/\D{3}/g,'');
                        setValue(e.target.value.replace(/\D{3}/g,''));
                        submit();
                    }
                }}
                styles={{ root: {padding: 15}}}
            />
            
    </ItemButton>
}