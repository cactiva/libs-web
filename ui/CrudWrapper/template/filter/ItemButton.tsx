import { observer, useObservable } from 'mobx-react-lite';
import { ActionButton, Callout, IconButton, Label } from 'office-ui-fabric-react';
import * as React from 'react';

export default observer(({ label, style, labelStyle, value, onClose, children, setValue, callout }: any) => {
    const meta = useObservable({
        show: false,
    });
    const btnRef = React.useRef(null);
    let valueContentEl = <Label style={{ marginLeft: '2px' }}>
        {value || 'All'}
    </Label>;
    let valueNoCalloutEl = React.isValidElement(value) ? value :
        <ActionButton style={style} onClick={() => {
            meta.show = true;
        }}> {valueContentEl}
        </ActionButton>;
    const btnContent = <>
        <Label style={{ fontWeight: 'normal', fontSize: 14, ...labelStyle }}>
            {typeof label === 'string' ? `${label}: ` : label}
        </Label>
        {callout === false ? valueNoCalloutEl : valueContentEl}
    </>;
    return <>
        <div ref={btnRef}>
            {callout === false
                ? <div style={{
                    height: 38,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    ...style
                }}>{btnContent}</div>
                : <ActionButton style={style} onClick={() => {
                    meta.show = true;
                }}> {btnContent}</ActionButton>
            }
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