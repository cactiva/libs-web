import { Label } from "@fluentui/react/lib/Label";
import { MessageBar, MessageBarType } from "@fluentui/react/lib/MessageBar";
import { Input } from "@src/libs/ui";
import _ from "lodash";
import { toJS } from "mobx";
import { observer, useLocalStore } from "mobx-react-lite";
import * as React from "react";
import FileUpload from "../fields/FileUpload";
import SelectFk from "../fields/SelectFk";

const renderField = (e, idx, isSection, presuf, meta) => {
  if (!e.children) {
    return <React.Fragment key={idx}>{e}</React.Fragment>;
  }

  if (isSection === false && e.props.section) return null;
  let Field = e.children.type;

  if (e.children.type.libType === "Input") Field = Input;
  if (e.children.type.libType === "FileUpload") Field = FileUpload;
  if (e.children.type.libType === "SelectFk") Field = SelectFk;

  const ps = _.find(presuf, { path: e.props.path });
  const overridenProps: any = {};
  const onBlur = _.get(e, "props.options.onBlur");
  if (onBlur) {
    overridenProps.onBlur = (ev) => {
      onBlur(ev, meta.data);
    };
  }

  let epath = e.props.path;
  let relTo = _.get(e.props, "options.relation.to");
  if (relTo) {
    epath = relTo;
  }

  return (
    <Field
      {...e.props}
      {...e.props.children.props}
      {...e.children.props}
      {...overridenProps}
      prefix={_.get(ps, "prefix")}
      suffix={_.get(ps, "suffix")}
      value={_.get(meta.data, epath)}
      errorMessage={meta.errors[epath]}
      onChange={(v) => {
        const value = _.get(v, "target.value", v);
        _.set(meta.data, epath, value);
        const onChange = _.get(e, "props.children.props.onChange");

        if (relTo) {
          meta.data[e.props.path].id = value;
        }

        if (onChange) {
          onChange(v, meta.data);
        } else {
          const optionsOnChange = _.get(e, "props.options.onChange");
          if (optionsOnChange) optionsOnChange(v, meta.data);
        }
      }}
      key={idx}
    />
  );
};

export default observer(
  ({ parsed, data, errors, fields, formRef, events }: any) => {
    const meta = useLocalStore(() => ({
      data: toJS(data),
      errors: toJS(errors) || {},
      beforeSubmit: _.get(events, "beforeSubmit"),
      afterSubmit: _.get(events, "afterSubmit"),
    }));

    React.useEffect(() => {
      meta.data = data;
    }, [data]);

    const errorLen = Object.keys(meta.errors).length;
    const sections = {};
    fields.columns.forEach((e) => {
      if (e.props.section) {
        if (!sections[e.props.section]) {
          sections[e.props.section] = [];
        }

        sections[e.props.section].push(e);
      }
    });
    const presuf = _.map(_.get(parsed, "table.head.children"), "props");

    formRef.current = meta;
    const sectionKeys = Object.keys(sections);
    const columns = fields.columns;
    if (errorLen > 0) {
      console.log(toJS(meta.errors));
    }

    return (
      <div style={{ padding: 10 }}>
        {errorLen > 0 && (
          <div style={{ flex: 1, width: "100%", marginBottom: 20 }}>
            <MessageBar
              messageBarType={MessageBarType.error}
              isMultiline={false}
            >
              Save Failed. Please fix {errorLen} error below:
            </MessageBar>
          </div>
        )}
        {sectionKeys.map((key) => {
          return (
            <div
              key={key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                marginBottom: "30px",
              }}
            >
              <Label
                style={{
                  fontSize: 18,
                  paddingLeft: 5,
                  fontWeight: 300,
                  color: "#777",
                  borderBottom: "1px solid #ccc",
                  marginBottom: "5px",
                }}
              >
                {key}
              </Label>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  paddingLeft: "15px",
                }}
              >
                {sections[key].map((e, idx) =>
                  renderField(e, idx, true, presuf, meta)
                )}
              </div>
            </div>
          );
        })}

        {sectionKeys.length > 0 && (
          <div
            style={{
              borderBottom: "1px solid #ccc",
              width: "100%",
              marginTop: "20px",
              marginBottom: "20px",
            }}
          ></div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            paddingLeft: sectionKeys.length > 0 ? 15 : 0,
            flexWrap: "wrap",
          }}
        >
          {columns.map((e, idx) => renderField(e, idx, false, presuf, meta))}
        </div>
        <div style={{ height: 300 }}> </div>
      </div>
    );
  }
);
