import _ from 'lodash';
import { observable } from 'mobx';
import { observer, useObservable } from 'mobx-react-lite';
import * as React from 'react';
import parserChildren from './utils/parserChildren';
import { Spinner } from 'office-ui-fabric-react';

const Template = require("./template/Base").default;
export const columnDefs = observable({});
const idKey = 'id';

export default observer((props: any) => {
    const meta = useObservable({
        front: {
            mode: ''
        }
    });
    const { data, children } = props;
    if (!data || !children) return <div style={{ width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
    </div>;

    const structure = _.get(props, 'data.structure');
    const auth = _.get(props, 'data.auth');
    const parsed = parserChildren(props);

    return <Template
        idKey={idKey}
        structure={structure}
        auth={auth}
        parsed={parsed}
        mode={meta.front.mode}
        setMode={(newmode) => meta.front.mode = newmode} />;
})