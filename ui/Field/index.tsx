import _ from 'lodash';
import * as React from 'react';
import Input from '../Input';

export default (props: any) => {
    const type = _.get(props, 'children.type');
    const childProps = _.get(props, 'children.props');


    if (type === Input) {

        const onChange = (e: any) => {
            const value = e.target.value;
            props.setValue(value)
        }
        return <Input value={props.value} onChange={onChange} label={props.label} styles={props.styles} {...props} {...props.children.props} children={undefined} />;
    } else {
        const onChange = (e: any) => {
            props.setValue(e)
        }
        const Component = props.children.type;
        return <Component styles={props.styles} {...props} {...childProps} onChange={onChange} />;
    }
};


