import { generateFieldWidth } from "@src/libs/ui/CrudWrapper/template/form/utils/generateFormField";
import { dateFormat } from "@src/libs/utils/date";
import _ from "lodash";
import { observer } from "mobx-react-lite";
import * as React from "react";
import Dropdown from "./SelectFk.dropdown";
import Popup from "./SelectFk.popup";

const Field = observer((props: any) => {
  return props.relationPage ? (
    <Popup
      {...props}
      styles={
        props.fieldWidth
          ? {
              root: {
                width: generateFieldWidth(props.fieldWidth),
                marginRight: "10px",
              },
            }
          : undefined
      }
    />
  ) : (
    <Dropdown
      {...props}
      styles={
        props.fieldWidth
          ? {
              container: {
                width: generateFieldWidth(props.fieldWidth),
                marginRight: "10px",
              },
            }
          : undefined
      }
    />
  );
});
(Field as any).libType = "SelectFk";
export default Field;

export const formatRelationLabel = (keys, e, colDef?) => {
  let usedKeys = keys;

  if (keys.length > 5) {
    usedKeys = keys.filter((f) => {
      if (f.indexOf("name") >= 0) {
        return true;
      }
      return false;
    });
  } else {
    if (usedKeys.length === 0) {
      for (let i in keys) {
        if ((i as any) * 1 <= 5) usedKeys.push(keys[i]);
      }
    }
  }

  return _.trim(
    usedKeys
      .filter((f) => f !== "id")
      .map((f) => {
        return formatSingleString(e, f, _.get(colDef, "columns"));
      })
      .join(" • ")
      .replace(/ •  • /gi, " • "),
    " • "
  );
};

const formatSingleString = (e, f, cdef) => {
  if (!e) return "";
  if (typeof e[f] === "object" && e[f] !== null) {
    const kef = Object.keys(e[f]);
    return kef
      .map((k) => {
        if (typeof e[f][k] === "object") {
          return formatSingleString(e[f], k, _.get(cdef, k));
        }
        return e[f][k];
      })
      .join(" • ");
  }
  const cd = _.get(cdef, f);
  if (cd) {
    const type = cd.data_type;
    switch (type) {
      case "timestamp without time zone":
      case "timestamp with time zone":
        return dateFormat(e[f]);
      case "date":
        return dateFormat(e[f], "dd MMM yyyy");
    }
  }

  return e && e[f];
};
