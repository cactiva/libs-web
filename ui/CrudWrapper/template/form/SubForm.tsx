import * as React from 'react';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import Base from '../Base';
import { observer, useObservable } from 'mobx-react-lite';

export default ({ fields, auth }) => {
    const relationKeys = Object.keys(fields.relations);
    return <Pivot
        className="base-form-sub"
        styles={{ itemContainer: { flex: 1, display: 'flex' }, }}
        style={{ display: 'flex', flex: 1, flexDirection: 'row', borderRight: '1px solid #ececeb', alignItems: 'stretch' }}>
        {
            relationKeys.map((e, key) => {
                const rel = fields.relations[e];
                const sub: any = rel.sub;
                if (!sub || (sub && !sub.parsed)) return null;
                return <PivotItem key={e}
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    headerText={rel.column.props.label}
                    headerButtonProps={{
                        'data-order': key,
                        'data-title': rel.column.props.label
                    }}
                >
                    <SubBase sub={sub} auth={auth} />
                </PivotItem>
            })
        }
    </Pivot>;
}

const SubBase = observer(({ sub, auth }: any) => {
    const meta = useObservable({
        mode: ''
    })
    return <Base
        structure={sub.structure}
        auth={auth}
        parsed={{ ...sub.parsed, title: { children: meta.mode === '' ? '' : sub.parsed.title.children } }}
        mode={meta.mode}
        style={{ flexDirection: meta.mode === '' ? 'column' : 'row' }}
        headerStyle={meta.mode === '' ? {
            position: 'absolute',
            right: 10,
            top: -5
        } : { flexDirection: 'column', height: '100%', justifyContent: 'flex-start' }}
        setMode={(v) => meta.mode = v}
    />;
})