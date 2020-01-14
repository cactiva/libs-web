import { observer, useObservable } from 'mobx-react-lite';
import { ActionButton, Callout, PrimaryButton, DefaultButton, IconButton } from 'office-ui-fabric-react';
import * as React from 'react';

export default observer(({ label, value, onClose, children, setValue }: any) => {
    const meta = useObservable({
        show: false,
    });
    const btnRef = React.useRef(null);
    return <>
        <div ref={btnRef}>
            <ActionButton onClick={() => {
                meta.show = true;
            }} text={`${label}: ${value || 'All'}`} />

        </div>

        {meta.show && (
            <Callout
                onDismiss={() => {
                    meta.show = false
                    if (onClose) {
                        onClose();
                    }
                }}
                setInitialFocus={true}
                target={btnRef.current}
            >
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
                    {children}
                    <IconButton iconProps={{ iconName: 'Trash' }} onClick={() => {
                        meta.show = false;
                        setValue(undefined);
                        if (onClose) {
                            onClose();
                        }
                    }} />
                </div>
            </Callout>
        )}
    </>;
})