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
    bypass?: boolean
    isRequired?: boolean
}

export default observer((iprops: IFieldProps) => {
    const Component = iprops.children.type;
    if (iprops.bypass) {
        return <Component
            {...iprops.children.props}
            value={iprops.value}
            setValue={iprops.setValue} />;
    }

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
        value: iprops.value,
    }

    if (cprops.onChange) {
        console.log(props);
        props.setValue = iprops.setValue;
        props.onChange = cprops.onChange;
    } else {
        props.onChange = (e: any) => {
            const value = _.get(e, 'target.value', e);
            iprops.setValue(value);
        }
    }
    return <Component {...props} />;
});


