import _ from 'lodash';
import * as React from 'react';
import Input from '../Input';
import { observer, useObservable } from 'mobx-react-lite';
import SelectFk from '../CrudWrapper/template/fields/SelectFk';

interface IFieldProps {
    label?: string
    path?: string
    relation?: any
    options?: {
        actions?: { type: string }[],
        default?: {
            [key: string]: any
        }
    }
    setValue?: any
    value?: any
    children?: any
    styles?: any
    style?: any
    isRequired?: boolean
}

export default observer((iprops: IFieldProps) => {
    const Component = iprops.children.type;
    const cprops = _.get(iprops, 'children.props', {});
    const meta = useObservable({
        valueFrom: cprops.value ? 'cprops' : 'iprops',
        value: iprops.value
    })
    let props: any = {
        label: iprops.label,
        style: cprops.style || iprops.style,
        styles: cprops.styles || iprops.styles,
        required: iprops.isRequired,
        value: iprops.value
    }

    switch (Component) {
        case Input:
            if (!meta.value && meta.value !== '') meta.value = '';
            props.value = meta.value;
            props.onChange = (e: any) => {
                const value = _.get(e, 'target.value', e);
                meta.value = value;
            }
            props.onBlur = (e: any) => {
                iprops.setValue(meta.value);
            }
            break;
        case SelectFk:
            props.value = iprops.value;
            props.setValue = iprops.setValue;
            for (let i in cprops) {
                props[i] = cprops[i]
            }
            break;
        default:
            if (cprops.onChange) {
                props.onChange = cprops.onChange;
            } else {
                props.onChange = (e: any) => {
                    const value = _.get(e, 'target.value', e);
                    iprops.setValue(value);
                }
            }
    }
    return <Component {...props} />;
});


