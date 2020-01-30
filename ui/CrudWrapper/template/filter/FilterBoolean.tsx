import * as React from 'react';
import ItemButton from './ItemButton';
import { IStackTokens, Stack, Toggle } from 'office-ui-fabric-react';
import { observer, useObservable } from 'mobx-react-lite';

export default observer(({ label, field, value, setValue, submit }: any) => {
    return (
        <ItemButton
            label={label}
            field={field}
            setValue={setValue}
            onClose={() => {
                submit();
            }}
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

