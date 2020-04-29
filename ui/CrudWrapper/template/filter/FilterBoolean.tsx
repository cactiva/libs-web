import { observer } from 'mobx-react-lite';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import * as React from 'react';
import ItemButton from './ItemButton';

export default observer(({ label, field, value, setValue, submit }: any) => {
    return (
        <ItemButton
            label={label}
            field={field}
            setValue={setValue}
            onClear={submit}
            value={value}>
            <div style={{ paddingTop: 10, paddingLeft: 10 }}>
                <Toggle label={label.label} onText="Yes" offText="No" onChanged={
                    (e: any) => {
                        setValue(e ? 'Yes' : 'No');
                        submit()
                    }
                } />
            </div>
        </ItemButton>
    );
});

