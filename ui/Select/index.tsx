import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { ComboBox, IComboBoxStyles } from 'office-ui-fabric-react';
import { toJS } from 'mobx';

interface ISelectProps {
    style?: any
    styles?: Partial<IComboBoxStyles>,
    selectedKey?: any,
    onChange?: any,
    label?: any,
    required?: any,
    errorMessage?: any,
    placeholder?: string,
    className?: string,
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