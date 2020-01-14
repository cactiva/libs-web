import _ from 'lodash';
import { observer, useObservable } from 'mobx-react-lite';
import { Callout, Checkbox, IconButton } from 'office-ui-fabric-react';
import React, { useEffect, useRef } from 'react';
import FilterString from './FilterString';
import FilterInteger from './FilterInteger';
import FilterDecimal from './FilterDecimal';
import FilterDateTime from './FilterDateTime';
import FilterMoney from './FilterMoney';
import { toJS } from 'mobx';
import FilterBoolean from './FilterBoolean';

export default observer((props: any) => {
    const { reload, filter, columns, colDef, fkeys } = props;
    const meta = useObservable({
        show: false,
        visibles: {},
        init: false
    })
    const btnRef = useRef(null);

    useEffect(() => {
        if (!meta.init) {
            if (columns.length > 6) {
                for (let i = 0; i < 6; i++) {
                    const e = columns[i];
                    meta.visibles[e.key] = true;
                }
            } else {
                for (let i in columns) {
                    const e = columns[i];
                    meta.visibles[e.key] = true;
                }
            }
            meta.init = true;
        }
    }, []);

    return <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    }}>

        <div ref={btnRef}>
            <IconButton
                onClick={() => meta.show = true}
                iconProps={{ iconName: "GlobalNavButton" }} />
        </div>

        {columns.map((e, key) => {
            if (meta.visibles[e.key]) {
                const type = _.get(colDef, `${e.key}.data_type`);
                console.log(toJS(colDef[e.key]));
                const submit = () => {
                    reload();
                }
                const setValue = (newvalue) => {
                    if (!newvalue) {
                        delete filter.form[e.key];
                    } else 
                    filter.form[e.key] = newvalue;
                }
                switch (type) {
                    case "character varying":
                    case "text":
                        return <FilterString
                            setValue={setValue}
                            submit={submit}
                            value={filter.form[e.key]}
                            key={key}
                            field={e.key}
                            label={e.name} />
                    case "integer":
                        return <FilterInteger 
                            setValue={setValue}
                            submit={submit} 
                            key={key} 
                            value={filter.form[e.key]} 
                            field={e.key}
                            label={e.name} />                 
                    case "numeric": // money
                        return <FilterMoney 
                            setValue={setValue}
                            submit={submit} 
                            key={key} 
                            value={filter.form[e.key]} 
                            field={e.key}
                            label={e.name} /> 
                    case "double precision":
                    case "decimal":
                        return <FilterDecimal 
                            setValue={setValue}
                            submit={submit} 
                            key={key} 
                            value={filter.form[e.key]} 
                            field={e.key}
                            label={e.name} /> 
                    case "timestamp without time zone":
                    case "timestamp with time zone":
                        return <FilterDateTime submit={submit} key={key} value={e.key} label={e.name} />
                    case "boolean":
                        return <FilterBoolean 
                            setValue={setValue}
                            submit={submit} 
                            key={key} 
                            value={filter.form[e.key]} 
                            label={e.name}
                            field={e.key} />
                }

                return <div key={key}>[MISSING-{type}]</div>;
            }
        })}

        {meta.show && (
            <Callout
                onDismiss={() => meta.show = false}
                setInitialFocus={true}
                target={btnRef.current}
            >
                <div style={{
                    padding: 10,
                    display: "flex",
                    width: '250px',
                    flexWrap: 'wrap',
                    flexDirection: 'row'
                }}>
                    {columns.map((e, key) => {
                        return <Checkbox
                            key={e.key}
                            styles={{ root: { marginBottom: 3, marginRight: 3, width: '120px' } }}
                            label={e.name}
                            checked={!!meta.visibles[e.key]}
                            onChange={() => {
                                if (meta.visibles[e.key]) {
                                    meta.visibles[e.key] = false;
                                } else {
                                    meta.visibles[e.key] = true;
                                }
                            }} />;
                    })}
                </div>
            </Callout>
        )}
    </div>;
})
