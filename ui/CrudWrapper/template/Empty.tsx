import { Icon } from "@fluentui/react/lib/Icon";
import { Label } from "@fluentui/react/lib/Label";
import * as React from "react";


export default ({ text }: any) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        minWidth: 400,
        minHeight: 400,
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Icon iconName="ReadingMode" style={{ fontSize: 32 }} />
        <Label style={{ opacity: 0.7, marginTop: "5px", marginBottom: "-5px" }}>
          {text}
        </Label>
      </div>
    </div>
  );
};
