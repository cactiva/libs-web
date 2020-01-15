import _ from 'lodash';
import * as React from 'react';
import Input from '../Input';

export default (props: any) => {
    const type = _.get(props, 'children.type');
    const childProps = _.get(props, 'children.props');

    const onChange = (e: any) => {
        const value = e.target.value;
        console.log("iki value", value)
        props.setValue(value)
    }

    if (type === Input) {
        return <Input {...childProps} value={props.value} onChange={onChange} label={props.label} styles={props.styles} />;
    } else {
        return props.children;
    }
};


