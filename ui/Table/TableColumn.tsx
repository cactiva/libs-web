import * as React from 'react';

interface ITableColumn {
    path: string,
    title?: string,
    options?: {
        label?: (val, item) => any
    },
    children?: any
    content?: any
    relation?: any
}

export default (props: ITableColumn) => {
    return <div></div>;
}