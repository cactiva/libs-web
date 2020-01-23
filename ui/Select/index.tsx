import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { ComboBox } from 'office-ui-fabric-react';
import { toJS } from 'mobx';

interface ISelectProps {
    styles?: any,
    selectedKey?: any,
    onChange?: any,
    label?: any,
    required?: any,
    errorMessage?: any,
    placeholder?:string,
    items: (string | {
        value: string,
        label: string
    })[]
}

export default observer((props: ISelectProps) => {
    const items: any = (props.items || []).map(e => {
        if (typeof e === 'string') {
            return {
                key: e,
                text: e,
            }
        }
        if (typeof e === 'object') {
            return {
                key: e.value,
                text: e.label
            }
        }
    }).filter(e => !!e);
    return <ComboBox {...props} allowFreeform={true} options={items} />;
});