import { generateDeleteString } from '@src/libs/utils/genDeleteString';
import { queryAll } from '@src/libs/utils/gql';
import _ from 'lodash';
import { observer, useObservable } from 'mobx-react-lite';
import { ActionButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { columnDefs } from '..';
import { Text } from '../..';
import saveForm from '../utils/saveForm';
import Spinner from '../../Spinner';
import { toJS } from 'mobx';

export default observer(({ parsed, mode, form, getForm, setForm, colDef, structure, setLoading, setMode, auth, idKey, reload, style, hasRelation }: any) => {
    const title = _.get(parsed, 'title.children');
    let actions = _.get(parsed, 'actions.children', []);
    if (!_.find(actions, { props: { type: 'cancel' } })) {
        actions.push({ props: { type: 'cancel' } });
    }
    const meta = useObservable({
        loading: false,
        shouldRefresh: false
    })

    actions = actions.map(e => {
        switch (e.props.type) {
            case "create":
                if (mode === '') {
                    return {
                        key: 'create',
                        text: 'Create',
                        iconProps: { iconName: 'Add' },
                        onClick: () => {
                            setForm({});
                            setMode('create');
                        }
                    }
                }
                break;
            case "delete":
                if (mode === 'edit') {
                    return {
                        key: 'delete',
                        text: 'Delete',
                        iconProps: { iconName: 'Trash' },
                        onClick: async () => {
                            if (confirm('Are you sure ?')) {
                                const q = generateDeleteString(structure, {
                                    where: [
                                        {
                                            name: 'id',
                                            operator: '_eq',
                                            value: form['id'],
                                            valueType: 'Int'
                                        }
                                    ]
                                });

                                setLoading(true);
                                let res = await queryAll(q.query, { auth, raw: true });
                                if (res.errors) {
                                    setLoading(false);
                                    const msg = res.errors.map(e => {
                                        if (_.get(e, 'extensions.code') === 'constraint-violation') {
                                            const table = _.trim(e.message.split('" on table "')[1], '"');
                                            return `  • Please delete all rows on current ${_.startCase(table)}.`;
                                        }
                                        return `  • ${e.message}`;
                                    }).filter(e => !!e);
                                    alert('Delete failed: \n' + msg.join('\n'));
                                    return false;
                                }
                                await reload();
                                setLoading(false);
                                setMode('');
                            }
                        }
                    }
                }
                break;
            case "cancel":
                if (mode !== '') {
                    return {
                        key: 'cancel',
                        text: '',
                        iconProps: { iconName: 'ChevronLeft' },
                        onClick: () => {
                            setMode('');
                            if (meta.shouldRefresh) {
                                reload();
                            }
                        }
                    }
                }
                break;
            case "save":
                if (mode !== '') {
                    return {
                        key: 'save',
                        text: 'Save',
                        primary: true,
                        iconProps: { iconName: 'Save' },
                        onClick: () => {
                            const rawForm = getForm();
                            const form = rawForm.data;
                            const errors = rawForm.errors;
                            const setErrors = (v) => rawForm.errors = v;
                            // validate form
                            const cdef: any = {};
                            columnDefs[structure.name].forEach(e => {
                                cdef[e.column_name] = e;
                            });
                            const newerrs = {};
                            const ovrd = structure.overrideForm || {};
                            _.map(cdef, (f, k) => {
                                if (f && f.is_nullable === 'NO' && !f.column_default) {
                                    if (!form[k] && k !== 'id' && !ovrd[k]) {
                                        let name = _.startCase(k);
                                        if (name.indexOf('Id') === 0) {
                                            name = name.substr(3);
                                        }
                                        newerrs[k] = `${name} is required.`;
                                    }
                                }
                            })

                            if (Object.keys(newerrs).length !== Object.keys(errors).length) {
                                if (Object.keys(newerrs).length > 0) {
                                    setErrors(newerrs);
                                }
                            }
                            if (Object.keys(newerrs).length === 0) {
                                saveForm({
                                    mode, form, structure, setLoading: (v) => {
                                        setLoading(v);
                                        meta.loading = v;
                                    }, setMode, auth, idKey, reload, hasRelation
                                })
                                setErrors({});
                            }

                        }
                    }
                }
                break;
            case "custom":
                const text = e.props.children.props.children ? e.props.children.props.children : 'Custom';
                const key = e.props.options && e.props.options.key ? e.props.options.key : 'custom';
                const icon = e.props.options && e.props.options.icon ? e.props.options.icon : 'Insert';
                if (mode == 'edit') {
                    return {
                        key: key,
                        text: text,
                        primary: true,
                        iconProps: { iconName: icon },
                        onClick: e.props.options && e.props.options.onClick ? e.props.options.onClick : () => { console.log('custom clicked') }
                    }
                }
                break;
        }
    }).filter(e => !!e);

    return <div style={{
        display: "flex",
        flexDirection: 'row',
        alignItems: 'center',
        height: '50px',
        justifyContent: 'space-between',
        ...style
    }}>
        <div style={{
            display: "flex",
            flexDirection: 'row',
            alignItems: 'center',
        }}>
            {actions.filter(e => e.key === 'cancel').map(e => <ActionButton
                text={e.text}
                style={{ marginRight: -15 }}
                key={e.key}
                iconProps={e.iconProps}
                onClick={e.onClick}
            />)}
            <Text style={{ padding: 10, fontSize: 21, fontWeight: 200 }}>{title}</Text>
        </div>
        <div>
            {
                meta.loading
                    ? <Spinner style={{ marginRight: 25 }} />
                    : actions.filter(e => e.key !== 'cancel').map(e => <ActionButton
                        text={e.text}
                        key={e.key}
                        iconProps={e.iconProps}
                        onClick={e.onClick}
                    />)
            }
        </div>
    </div>;
})