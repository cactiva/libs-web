import * as React from 'react';
import ItemButton from './ItemButton';
import { IStackTokens, Stack, Toggle } from 'office-ui-fabric-react';
import { observer, useObservable } from 'mobx-react-lite';

export default observer(({ label, field, value, setValue, submit }: any) => {
    const meta = useObservable({
        oldval: value
    })
    const stackTokens: IStackTokens = { childrenGap: 10 };
    label = { label }
    field = { field }
    return (
        <Stack
            tokens={stackTokens}>
            <ItemButton
                label={label}
                field={field}
                setValue={setValue}
                onClose={() => {
                    setValue(parseFloat(meta.oldval));
                    submit();
                }}
                value={value}>
                <Toggle label={label.label} onText="On" offText="Off" onChange={
                    (e: any) => {
                        meta.oldval = e.target.value;
                        setValue = value
                        onclose = submit()
                        value = { value }
                    }
                } />
            </ItemButton>

        </Stack>
    );
});

