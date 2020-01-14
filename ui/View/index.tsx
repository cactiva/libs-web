import * as React from 'react';

export default (props: any) => {
    return <div {...props} style={{
        display: 'flex',
        flexDirection: 'column',
        ...props.style
    }} />;
}
