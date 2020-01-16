import _ from 'lodash';
import { observer } from 'mobx-react-lite';
import { ActionButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { Text } from '../..';
import saveForm from '../utils/saveForm';
import { generateDeleteString } from '@src/libs/utils/genDeleteString';
import { queryAll } from '@src/libs/utils/gql';

export default observer(({ parsed, mode, form, structure, setLoading, setMode, auth, idKey, reload, style, hasRelation }: any) => {
    const title = _.get(parsed, 'title.children');
    const actions = _.get(parsed, 'actions.children', []).map(e => {
        switch (e.props.type) {
            case "create":
                if (mode === '') {
                    return {
                        key: 'create',
                        text: 'Create',
                        iconProps: { iconName: 'Add' },
                        onClick: () => {
                            form = {};
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
                                            name: idKey,
                                            operator: '_eq',
                                            value: form[idKey],
                                            valueType: 'Int'
                                        }
                                    ]
                                });

                                setLoading(true);
                                await queryAll(q.query, { auth });
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
                            saveForm({ mode, form, structure, setLoading, setMode, auth, idKey, reload, hasRelation })
                        }
                    }
                }
                break;
            case "custom":
                const text = e.props.children.props.children ? e.props.children.props.children : 'Custom';
                const key = e.props.options && e.props.options.key ? e.props.options.key : 'custom';
                const icon =  e.props.options && e.props.options.icon ? e.props.options.icon : 'Insert';
                if (mode == 'edit') {
                    return {
                        key: key,
                        text: text,
                        primary: true,
                        iconProps: { iconName: icon },
                        onClick: e.props.options && e.props.options.onClick ? e.props.options.onClick : ()=>{console.log('custom clicked')}
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
            {actions.filter(e => e.key !== 'cancel').map(e => <ActionButton
                text={e.text}
                key={e.key}
                iconProps={e.iconProps}
                onClick={e.onClick}
            />)}
        </div>
    </div>;
})