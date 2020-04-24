import * as React from "react";
import { Spinner, SpinnerSize } from "office-ui-fabric-react/lib/Spinner";
import { Label } from "office-ui-fabric-react/lib/Label";

import _ from "lodash";
import { Icon } from "office-ui-fabric-react/lib/Icon";

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
