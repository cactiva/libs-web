import _ from 'lodash';
import * as React from 'react';
import Input from '../Input';

export default (props: any) => {
    const type = _.get(props, 'children.type');

    const onChange = (e: any) => {
        const value = e.target.value;
        props.setValue(value)
    }

    if (type === Input) {
        return <Input value={props.value} onChange={onChange} type={props.type} label={props.label} styles={props.styles} />;
    } else {
        const Component = props.children.type;
        return <Component  styles={props.styles} {...props} {...props.children.props} />;
    }
};


