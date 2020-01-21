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
    style?: any
    isRequired?: boolean
}

export default (props: IFieldProps) => {
    const childProps = _.get(props, 'children.props')
    const onChange = (e: any) => {
        props.setValue(e)
    }
    const Component = props.children.type;
    return <Component styles={props.styles} {...props} {...childProps} onChange={onChange} />;
};


