import * as React from "react";

interface ITableColumn {
  path: string;
  title?: string;
  options?: {
    label?: (val, item) => any;
  };
  suffix?: string;
  editable?: boolean;
  prefix?: string;
  children?: any;
  relation?: any;
  relationPage?: any;
}

export default (props: ITableColumn) => {
  return <div></div>;
};
