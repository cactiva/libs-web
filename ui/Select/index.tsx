import * as React from 'react';
import { observer } from 'mobx-react-lite';

interface ISelectProps {
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
                displayValue: e,
                searchValue: e
            }
        }
        if (typeof e === 'object') {
            return {
                key: e.value,
                displayValue: e.label,
                searchValue: e.value
            }
        }
    }).filter(e => !!e);

    return <div />;
});