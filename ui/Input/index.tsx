import { Select } from "@src/libs";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import * as React from "react";
import { useRifm } from './rifm';



const clearValue = (value, type) => {
  if (type === "number")
    return parseInt((value || 0).toString().replace(/\D/g, ""));
  if (type === "decimal" || type === "money") {
    return parseFloat((value || 0).toString().replace(/,/g, ""));
  }
  return 0;
};

const formatValue = (value, type) => {
  if (type === "decimal" || type === "money") {
    if (typeof value === "string" && value[value.length - 1] === ".") {
      console.log(value);
      return value;
    }
    return clearValue(value, type).toLocaleString('en').replace(/,/gi, ",");
  }
  if (type === "number") return clearValue(value, type).toString();
  return value;
};


export default observer((iprops: any) => {
  const props = _.cloneDeep(iprops);
  const meta = useObservable({ oldval: props.value || '' });
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

    React.useEffect(() => {
      meta.oldval = meta.oldval ? formatValue(meta.oldval, props.type) : meta.oldval;
    }, []);

    const rifm = useRifm({
      value: meta.oldval,
      accept: /[\d\.]+/g,
      onChange: (v) => { meta.oldval = v },
      format: (str) => formatValue(str, props.type)
    })

    return (
      <TextField
        {...props}
        value={rifm.value}
        onChange={(e: any) => {
          rifm.onChange(e);
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
  } else if (props.type === "boolean") {
    const val = _.get(props, 'options.booleanVal');
    const booleanVal = val ? val : [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }];
    return (
      <Select
        label={iprops.label}
        items={booleanVal}
        selectedKey={meta.oldval ? meta.oldval.toString() : 'false'}
        onChange={(e, val) => {
          meta.oldval = val.key;
          if (props.onChange) {
            props.onChange({
              ...e,
              target: {
                ...e.target,
                value: meta.oldval
              },
            });
          }
        }}
      ></Select>
    )
  }

  return <TextField {...props} />;
});
