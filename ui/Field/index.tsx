import _ from 'lodash';
import * as React from 'react';
import Input from '../Input';

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
    isRequired?: boolean
}

export default (props: IFieldProps) => {
    const type = _.get(props, 'children.type');;
    if (type === Input) {
        const onChange = (e: any) => {
            const value = e.target.value;
            props.setValue(value)
        }
        return <Input value={props.value} onChange={onChange} label={props.label} styles={props.styles} {...props} {...props.children.props} children={undefined} />;
    } else {
        const childProps = _.get(props, 'children.props')
        const onChange = (e: any) => {
            props.setValue(e)
        }
        const Component = props.children.type;
        return <Component styles={props.styles} {...props} {...childProps} onChange={onChange} />;
    }
};


