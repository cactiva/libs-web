import * as React from 'react';
import ItemButton from './ItemButton';
import { TextField, IStackTokens, Stack, Toggle } from 'office-ui-fabric-react';
import { observer, useObservable } from 'mobx-react-lite';

export default observer(({ label, field, value, setValue, submit }: any) => {
    const meta = useObservable({
        oldval: value
    })
    const stackTokens: IStackTokens = { childrenGap: 10 };

    const ToggleBasicExample: React.FunctionComponent = () => {
    return (
    <Stack tokens={stackTokens}>
      <Toggle label="Enabled and checked" defaultChecked onText="On" offText="Off" onChange={(e: any) => {
                meta.oldval = e.target.value;
            }} />
    </Stack>
  );
};

function _onChange(ev: React.MouseEvent<HTMLElement>, checked: boolean) {
  console.log('toggle is ' + (checked ? 'checked' : 'not checked'));
}
    return <ItemButton
        label={label}
        field={field}
        onClose={() => submit()}
        value={value}>
        {/* <TextField
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
            styles={{ root: { padding: 10 } }} /> */}
        
        
    </ItemButton>;
    
})