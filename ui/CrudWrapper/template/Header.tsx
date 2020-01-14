import _ from 'lodash';
import { observer } from 'mobx-react-lite';
import { ActionButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { Text } from '../..';

export default observer(({ parsed, mode, setMode }: any) => {
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
                    }
                }
                break;
            case "cancel":
                if (mode !== '') {
                    return {
                        key: 'cancel',
                        text: 'Cancel',
                        iconProps: { iconName: 'Cancel' },
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
                            alert('ngesave')
                        }
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
        justifyContent: 'space-between'
    }}>
        <Text style={{ padding: 10, fontSize: 21, fontWeight: 200 }}>{title}</Text>
        <div>
            {actions.map(e => <ActionButton
                text={e.text}
                key={e.key}
                iconProps={e.iconProps}
                onClick={e.onClick}
            />)}
        </div>
    </div>;
})