import _ from 'lodash';
import { observable } from 'mobx';
import { observer, useObservable } from 'mobx-react-lite';
import * as React from 'react';
import parserChildren from './utils/parserChildren';
import { Spinner, Label, SpinnerSize } from 'office-ui-fabric-react';
import Loading from './template/Loading';

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
    if (!data || !children) return null;

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