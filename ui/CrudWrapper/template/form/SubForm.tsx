import * as React from 'react';
import { Pivot, PivotItem, Dropdown, IconButton, DefaultButton } from 'office-ui-fabric-react';
import Base from '../Base';
import { observer, useObservable } from 'mobx-react-lite';
import { useWindowSize } from '@src/libs/utils/useWindowSize';
import Select from '@src/libs/ui/Select';

export default observer(({ fields, auth }: any) => {
    const mobileMeta = useObservable({
        selectedKey: ""
    });
    const size = useWindowSize();
    const relationKeys = Object.keys(fields.relations);
    const children = relationKeys.map((e, key) => {
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
    });
    if (size.width > 800) {
        return <Pivot
            className="base-form-sub"
            styles={{ itemContainer: { flex: 1, display: 'flex' }, }}
            style={{ display: 'flex', flex: 1, flexDirection: 'row', borderRight: '1px solid #ececeb', alignItems: 'stretch' }}>
            {children}
        </Pivot>;
    } else {
        const items = relationKeys.map((e, idx) => {
            const rel = fields.relations[e];
            const label = rel.column.props.label;
            return {
                value: idx.toString(),
                label
            };
        })
        return <div className={`mobile-form-sub ${!!mobileMeta.selectedKey ? 'maximized' : ''}`}>
            <div className={`title`}>
                <Select placeholder="Sub Data..."
                    items={items}
                    style={{ flex: 1 }}
                    selectedKey={mobileMeta.selectedKey}
                    onChange={(e, item) => {
                        mobileMeta.selectedKey = item.key;
                    }} />
                {!!mobileMeta.selectedKey &&
                    <IconButton
                        onClick={() => {
                            mobileMeta.selectedKey = "";
                        }}
                        style={{ marginLeft: 5, padding: 0, minWidth: 40 }}
                        iconProps={{
                            iconName: 'MiniContract', style: {
                                fontSize: 20
                            }
                        }} />}
            </div>
            {!!mobileMeta.selectedKey &&
                <div style={{
                    flex: 1, position: 'relative', marginTop: 10,
                    display: 'flex',
                    marginLeft: -10, marginRight: -10, borderTop: '1px solid #ccc'
                }}>
                    {children[parseInt(mobileMeta.selectedKey)]}
                </div>
            }
        </div>;
    }
});

const SubBase = observer(({ sub, auth }: any) => {
    const meta = useObservable({
        mode: ''
    })
    const size = useWindowSize();
    const style = size.width < 800
        ? {}
        : { flexDirection: meta.mode === '' ? 'column' : 'row' };
    const headerStyle = size.width < 800
        ? meta.mode === ''
            ? {
                position: 'absolute',
                bottom: 10,
                right: 10,
                zIndex: 99,
                borderRadius: 5,
                boxShadow: '0 0 5px 0 rgba(0,0,0,.3)',
                background: 'white'
            }
            : {}
        : meta.mode === ''
            ? {
                position: 'absolute',
                right: 10,
                top: -5
            }
            : { flexDirection: 'column', height: '100%', justifyContent: 'flex-start' };
    return <Base
        structure={sub.structure}
        auth={auth}
        parsed={{ ...sub.parsed, title: { children: meta.mode === '' ? '' : sub.parsed.title.children } }}
        mode={meta.mode}
        style={style}
        headerStyle={headerStyle}
        setMode={(v) => meta.mode = v}
    />;
})