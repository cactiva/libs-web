import { useLocation } from "@reach/router";
import _ from "lodash";
import { observable } from "mobx";
import { observer, useLocalStore } from "mobx-react-lite";
import * as React from "react";
import parserChildren from "./utils/parserChildren";

const Template = require("./template/Base").default;
export const columnDefs = observable({});
export const idKey = "id";

interface ICrudWrapper {
  data: any;
  afterQuery?: (list: any[]) => void;
  onChange?: (e: any) => void;
  style?: any;
  generateForm?: "auto" | "manual";
  children: any;
  isRoot?: boolean;
  enableSub?: boolean;
}

export default observer((props: ICrudWrapper) => {
  const { data, children, afterQuery } = props;
  if (!data || !children) return null;
  const structure = _.get(props, "data.structure");
  const auth = _.get(props, "data.auth");
  const parsed = parserChildren(props);

  return (
    <Template
      idKey={idKey}
      structure={structure}
      auth={auth}
      parsed={parsed}
      afterQuery={afterQuery}
      isRoot={props.isRoot === undefined ? true : props.isRoot}
      generateForm={props.generateForm || "auto"}
      enableSub={props.enableSub}
    />
  );
});
