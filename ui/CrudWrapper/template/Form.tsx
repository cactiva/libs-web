import * as React from 'react';
import Form from '../../Form';
import _ from 'lodash';
import { Field } from '../..';
import { toJS } from 'mobx';

export default ({ form, data, mode }: any) => {
    if (typeof form !== 'function') return null;
    const parsedForm = form(mode);
    return <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, padding: 10, overflow: 'auto' }}>
            <Form data={data} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {_.get(parsedForm, 'props.children', []).map((e, idx) => {
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
    </div>;
}