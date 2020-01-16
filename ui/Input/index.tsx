import * as React from 'react';
import { TextField } from 'office-ui-fabric-react';
import { useObservable, observer } from 'mobx-react-lite';

export default observer((props: any) => {
    const meta = useObservable({ oldval: formatValue(props.value, props.type) })
    if (props.type === "money"
        || props.type === "number"
        || props.type === "decimal") {
        return <TextField
            {...props}
            value={meta.oldval}
            onChange={(e: any) => {
                meta.oldval = formatValue(e.target.value, props.type);
                if (props.onChange) {
                    props.onChange({
                        ...e,
                        target: {
                            ...e.target,
                            value: clearValue(meta.oldval, props.type)
                        }
                    })
                }
            }}
        />
    }
    return <TextField {...props} />;
})

const clearValue = (value, type) => {
    if (type === "number") return parseInt((value || 0).toString().replace(/\D/g, ''));
    if (type === "money") return parseInt((value || 0).toString().replace(/\D/g, ''));
    if (type === "decimal") return parseFloat((value || 0).toString().replace(/\D/g, ''));
    return 0;
}

const formatValue = (value, type) => {
    if (type === "money") return clearValue(value, type).toLocaleString().replace(/,/ig, '.')
    if (type === "number") return clearValue(value, type).toString()
    if (type === "decimal") return clearValue(value, type).toString()
}