import _ from 'lodash';
import { observer, useObservable } from 'mobx-react-lite';
import * as React from 'react';

interface IFieldProps {
    label?: string
    path?: string
    options?: {
        actions?: { type: string }[],
        relation?: {
            query: string,
            label: (item: any) => string | Promise<string>
        },
        type?: string,
        table?: {
            addColumns?: {
                path: string,
                title: string,
                content: (row: any) => React.ReactElement
                position?: 'first' | 'last' | number
            }[],
            removeColumns?: string[]
        },
        form?: { 
            afterLoad?: (form) => void,
            beforeSubmit?: (form, errors) => void,
            afterSubmit?: (form, lastInsertId) => void,
        },
        default?: {
            [key: string]: any
        }
    }
    setValue?: any
    value?: any
    children?: any
    section?: string
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
    // const meta = useObservable({
    //     valueFrom: cprops.value ? 'cprops' : 'iprops',
    //     value: iprops.value
    // })
    let props: any = {
        label: iprops.label,
        style: cprops.style || iprops.style,
        styles: cprops.styles || iprops.styles,
        required: iprops.isRequired,
        value: iprops.value,
    }

    if (cprops.onChange) {
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


