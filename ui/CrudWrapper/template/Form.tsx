import _ from 'lodash';
import * as React from 'react';
import { Field } from '../..';
import Form from '../../Form';
import SplitPane from 'react-split-pane';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import { observer, useObservable } from 'mobx-react-lite';
import Base from './Base';
import generateSubStructure from '../utils/generateSubStructure';

export default observer(({ structure, form, data, mode, colDef, auth, parsed, fkeys, setHasRelation }: any) => {
    const meta = useObservable({
        size: localStorage['cactiva-app-split-size'] || '200',
        subs: {

        }
    })

    if (typeof form !== 'function') return null;

    const parsedForm = form(mode);
    const fields = processFields(parsedForm, structure, colDef, fkeys);
    const relationKeys = Object.keys(fields.relations);
    if (setHasRelation) {
        setHasRelation(relationKeys.length > 0)
    }

    return <div style={{ flex: 1, position: 'relative' }}>
        <SplitPane
            split="horizontal"
            resizerStyle={{ borderTop: '3px double #ccc', cursor: 'row-resize', }}
            primary="second"
            onChange={size => {
                meta.size = size.toString();
                localStorage.setItem('cactiva-app-split-size', size.toString())
            }}
            defaultSize={relationKeys.length === 0 ? "0px" : meta.size + "px"}>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, padding: 10, overflow: 'auto' }}>
                <Form data={data} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                    {fields.columns.map((e, idx) => {
                        return <Field key={idx} {...e.props}
                            styles={{
                                root: {
                                    width: '32%',
                                    marginRight: '10px'
                                }
                            }} />;
                    })}
                </Form>
            </div>
            {(mode !== 'create' && relationKeys.length > 0) && <Pivot
                className="base-form-sub"
                styles={{ itemContainer: { flex: 1, display: 'flex' }, }}
                style={{ display: 'flex', flex: 1, flexDirection: 'row', borderRight: '1px solid #ececeb', alignItems: 'stretch' }}>
                {
                    relationKeys.map((e, key) => {
                        const rel = fields.relations[e];
                        const sub: any = generateSubStructure(meta.subs, rel, structure, parsed, data);

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
                            <Base
                                structure={sub.structure}
                                auth={auth}
                                parsed={sub.parsed}
                                mode={sub.mode}
                                style={{ flexDirection: sub.mode === '' ? 'column' : 'row' }}
                                headerStyle={sub.mode === '' ? {} : { flexDirection: 'column', height: '100%', justifyContent: 'flex-start' }}
                                setMode={sub.setMode}
                            />
                        </PivotItem>
                    })
                }
            </Pivot>}
        </SplitPane>
    </div >;
});

const processFields = (parsedForm: any, structure, colDef, fkeys) => {
    const relations = {};
    const columns = _.get(parsedForm, 'props.children', []).filter(e => {
        let fk = fkeys[e.props.path];
        if (!fk) fk = fkeys[e.props.path.substr(0, e.props.path.length - 1)];
        if (fk && !fk.table_schema) {
            relations[e.props.path] = {
                path: e.props.path,
                column: e,
                fkey: fk
            };
            return false;
        }
        return true;
    });

    return { columns, relations };
}