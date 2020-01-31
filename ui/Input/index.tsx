import * as React from 'react';
import { TextField } from 'office-ui-fabric-react';
import { useObservable, observer } from 'mobx-react-lite';
import _ from 'lodash';

export default observer((iprops: any) => {
    const props = _.cloneDeep(iprops);
    const meta = useObservable({ oldval: formatValue(props.value, props.type) })
    if (props.children) {
        delete props.children;
    }
    if (!props.value) {
        props.value = '';
    }
    if (iprops.setValue) {
        props.value = meta.oldval;
        props.onChange = (e: any) => {
            meta.oldval = e.target.value;
        }
        props.onBlur = (e: any) => {
            props.setValue(meta.oldval);
        }
    }

    if (props.onEnter) {
        const oldKeyDown = props.onKeyDown;
        const onKeyDown = (e) => {
            if (e.which === 13) {
                if (iprops.setValue) {
                    props.setValue(meta.oldval);
                }
                props.onEnter();
            }
            if (oldKeyDown)
                oldKeyDown()
        }

        props.onKeyDown = onKeyDown;

    }

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
    return value;
}