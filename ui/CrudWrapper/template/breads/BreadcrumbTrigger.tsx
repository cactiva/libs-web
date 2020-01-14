import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { observable } from 'mobx';

export default observer((props: any) => {
    console.log(props);

    return <div></div>;
})