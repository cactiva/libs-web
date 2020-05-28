import * as React from "react";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { useObservable, observer } from "mobx-react-lite";
import _ from "lodash";

export default observer((iprops: any) => {
  const props = _.cloneDeep(iprops);
  const meta = useObservable({ oldval: formatValue(props.value, props.type) });
  if (props.children) {
    delete props.children;
  }
  if (!props.value) {
    props.value = "";
  }
  if (iprops.setValue) {
    props.value = meta.oldval;
    props.onChange = (e: any) => {
      meta.oldval = e.target.value;
    };
    props.onBlur = (e: any) => {
      props.setValue(meta.oldval);
    };
  }

  if (props.onEnter) {
    const oldKeyDown = props.onKeyDown;
    const onKeyDown = (e) => {
      if (e.which === 13) {
        if (iprops.setValue) {
          props.setValue(meta.oldval);
        }
        props.onEnter();
      }
      if (oldKeyDown) oldKeyDown();
    };

    props.onKeyDown = onKeyDown;
  }

  if (
    props.type === "money" ||
    props.type === "money-cents" ||
    props.type === "number" ||
    props.type === "decimal" ||
    props.type === "double"
  ) {
    return (
      <TextField
        {...props}
        value={meta.oldval}
        onChange={(e: any) => {
          meta.oldval = formatValue(e.target.value, props.type);
          if (props.onChange) {
            props.onChange({
              ...e,
              target: {
                ...e.target,
                value: clearValue(meta.oldval, props.type),
              },
            });
          }
        }}
      />
    );
  }

  return <TextField {...props} />;
});

const clearValue = (value, type) => {
  if (type === "number")
    return parseInt((value || 0).toString().replace(/\D/g, ""));
  if (type === "decimal" || type === "money") {
    if (value && typeof value === 'string' && value.toString().includes('.')) {
      if(!value.split('.').pop()) value = value.concat('01');
    }
    return parseFloat((value || 0).toString().replace(/,/g, ""));
  }
  return 0;
};

const formatValue = (value, type) => {
  if (type === "decimal" || type === "money") return clearValue(value, type).toLocaleString().replace(/,/gi, ",");
  if (type === "number") return clearValue(value, type).toString();
  return value;
};

  // if (type === "money") {
  //   if (!Number.isInteger(value) && typeof value !== 'string') {
  //     const num = value.toString().split('.');
  //     value = Number(num[0]);
  //   };
  //   return parseInt((value || 0).toString().replace(/\D/g, ""));
  // }
  // if (type === "decimal") return (value || 0).toString().replace(/[^0-9\.]+/g, '');
  // if (type === "double")
  //   return value ? parseFloat(value).toFixed(2) : parseFloat(value || 0);
  // return 0;

  // if (type === "decimal") return clearValue(value, type).toString();
  // if (type === "double") return clearValue(value, type);