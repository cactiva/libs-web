import _ from 'lodash';
import { toJS } from 'mobx';
import { observer, useObservable } from 'mobx-react-lite';
import * as React from 'react';
import { MessageBar, MessageBarType, Label } from 'office-ui-fabric-react';
export default observer(({ data, errors, fields, formRef }: any) => {
    const meta = useObservable({
        data: toJS(data),
        errors: toJS(errors) || {}
    });
    const errorLen = Object.keys(meta.errors).length;

    const sections = {};
    fields.columns.forEach(e => {
        if (e.props.section) {
            if (!sections[e.props.section]) {
                sections[e.props.section] = [];
            }

            sections[e.props.section].push(e);
        }
    })


    console.log(sections);
    const renderField = (e, idx, isSection = false) => {
        if (!isSection && e.props.section) return null;
        const Field = e.children.type;
        return <Field
            {...e.props}
            {...e.children.props}
            value={_.get(meta.data, e.props.path)}
            errorMessage={meta.errors[e.props.path]}
            onChange={(v) => {
                const value = _.get(v, 'target.value', v);
                _.set(meta.data, e.props.path, value);
            }}
            key={idx}
        />;
    }

    formRef.current = meta;
    const sectionKeys = Object.keys(sections);
    return <>
        {errorLen > 0 && <div style={{ flex: 1, width: '100%', marginBottom: 20 }}>
            <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
                Save Failed. Please fix {errorLen} error bellow:
        </MessageBar>
        </div>
        }

        {sectionKeys.map((key) => {
            return <div key={key} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                marginBottom: '30px'
            }}>
                <Label style={{
                    fontSize: 24,
                    paddingLeft: 5,
                    fontWeight: 300,
                    borderBottom: '1px solid #aaa',
                    marginBottom: '5px'
                }}>
                    {key}
                </Label>
                <div style={{
                    display: 'flex', flex: 1, flexDirection: 'row', flexWrap: 'wrap',
                    paddingLeft: '15px',
                }}>
                    {sections[key].map(renderField)}
                </div>
            </div>
        })}

        {sectionKeys.length > 0 && <div style={{
            borderBottom: '1px solid #ececeb',
            width: '100%',
            marginTop: '20px',
            marginBottom: '20px'
        }}></div>}

        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                paddingLeft: sectionKeys.length > 0 ? 15 : 0,
                flexWrap: 'wrap'
            }}>
            {fields.columns.map((e, idx) => renderField(e, idx, true))}
        </div>
        <div style={{ height: 300 }}> </div>
    </>
});