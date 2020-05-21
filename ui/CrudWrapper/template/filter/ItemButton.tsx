import { observer, useObservable } from "mobx-react-lite";
import { ActionButton, IconButton } from "office-ui-fabric-react/lib/Button";
import { Callout } from "office-ui-fabric-react/lib/Callout";
import { Label } from "office-ui-fabric-react/lib/Label";
import * as React from "react";

export default observer(
  ({
    label,
    style,
    labelStyle,
    value,
    onClose,
    onClear,
    children,
    setValue,
    callout,
  }: any) => {
    const meta = useObservable({
      show: false,
    });
    const btnRef = React.useRef(null);
    let valueContentEl = (
      <Label style={{ marginLeft: "2px" }}>{value || "All"}</Label>
    );
    let valueNoCalloutEl = React.isValidElement(value) ? (
      value
    ) : (
      <ActionButton
        style={style}
        onClick={() => {
          meta.show = true;
        }}
      >
        {" "}
        {valueContentEl}
      </ActionButton>
    );

    if (typeof value === "function") {
      valueNoCalloutEl = value(meta);
    }

    const btnContent = (
      <>
        <Label style={{ fontWeight: "normal", fontSize: 14, ...labelStyle }}>
          {typeof label === "string" ? `${label}: ` : label}
        </Label>
        {callout === false ? valueNoCalloutEl : valueContentEl}
      </>
    );
    return (
      <>
        <div ref={btnRef} className="filter-item">
          {callout === false ? (
            <div
              style={{
                height: 38,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                ...style,
              }}
            >
              {btnContent}
            </div>
          ) : (
            <ActionButton
              style={style}
              onClick={() => {
                meta.show = true;
              }}
            >
              {" "}
              {btnContent}
            </ActionButton>
          )}
        </div>

        {meta.show && (
          <Callout
            onDismiss={() => {
              meta.show = false;
              if (onClose) {
                onClose();
              }
            }}
            setInitialFocus={true}
            target={btnRef.current}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                paddingRight: 10,
              }}
            >
              {children}
              <IconButton
                iconProps={{ iconName: "Trash" }}
                onClick={() => {
                  meta.show = false;
                  setValue(undefined);
                  if (onClear) {
                    onClear();
                  } else if (onClose) {
                    onClose();
                  }
                }}
              />
            </div>
          </Callout>
        )}
      </>
    );
  }
);
