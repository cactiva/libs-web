import * as React from "react";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
import { Label } from "@fluentui/react/lib/Label";

import _ from "lodash";

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
        <Spinner size={SpinnerSize.large} />
        <Label style={{ opacity: 0.7, marginTop: "5px", marginBottom: "-5px" }}>
          {"Loading..."}
        </Label>
        <Label style={{ opacity: 0.5, fontSize: 10 }}>
          {_.upperCase(text)}
        </Label>
      </div>
    </div>
  );
};
