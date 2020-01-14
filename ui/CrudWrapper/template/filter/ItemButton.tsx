import { observer, useObservable } from 'mobx-react-lite';
import { ActionButton, Callout } from 'office-ui-fabric-react';
import * as React from 'react';

export default observer(({ label, field, value, onClose, children }: any) => {
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
                {children}
            </Callout>
        )}
    </>;
})