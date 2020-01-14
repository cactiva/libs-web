import React from 'react';
import _ from 'lodash';

export default (props: any) => {
    const source = props.source;
    const newProps = _.cloneDeep(props) || {};
    delete newProps.resizeMode;

    return <img src={source} alt="" {...newProps} />;
}
