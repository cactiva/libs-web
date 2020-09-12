import _ from "lodash";
import { observer, useLocalStore } from "mobx-react-lite";
import { IconButton } from '@fluentui/react/lib/Button';
import { ComboBox, IComboBoxStyles } from '@fluentui/react/lib/ComboBox';
import * as React from "react";
import ReactDOM, { createPortal } from "react-dom";

interface ISelectProps {
  style?: any;
  styles?: Partial<IComboBoxStyles>;
  selectedKey?: any;
  onChange?: any;
  label?: any;
  required?: any;
  errorMessage?: any;
  placeholder?: string;
  className?: string;
  readonly?: boolean;
  allowFreeForm?: boolean;
  modifier?: {
    add?: (item, list) => Promise<any>;
    edit?: (item, list) => Promise<any>;
    view?: (item, list) => Promise<any>;
    delete?: (item, list) => Promise<any>;
  };
  items: (
    | string
    | {
        value: string;
        label: string;
      }
  )[];
}

export default observer((props: ISelectProps) => {
  const meta = useLocalStore(() => ({
    portal: undefined as any,
  }));
  const items: any = (props.items || [])
    .map((e) => {
      if (typeof e === "string") {
        return {
          key: e,
          text: e,
        };
      }
      if (typeof e === "object") {
        return {
          key: e.value,
          text: e.label,
        };
      }
    })
    .filter((e) => !!e);
  const cref = React.useRef(null as any);
  const modifierList = Object.keys(props.modifier || {});
  let marginRight = 0;
  if (modifierList.length > 0) {
    if (_.get(props, "style.marginRight")) {
      marginRight = _.get(props, "style.marginRight");
    }

    if (_.get(props, "styles.root.marginRight")) {
      marginRight = _.get(props, "styles.root.marginRight");
    }
  }

  let onChange = undefined as any;
  if (props.onChange) {
    onChange = (e, v) => {
      if (!v) {
        if (props.selectedKey) {
          props.onChange(e, _.find(items, { key: props.selectedKey }));
        } else {
          props.onChange(e, items[0]);
        }
      } else {
        props.onChange(e, v);
      }
    };
  }

  React.useEffect(() => {
    if (modifierList.length > 0) {
      const input = _.get(cref.current, "_root.current.children.0.children.1");
      const el = (
        <div
          style={{
            borderLeft: "1px solid #999",
            display: "flex",
            flexDirection: "row",
            cursor: "default",
            alignItems: "center",
          }}
        />
      );
      const div = document.createElement("div");
      ReactDOM.render(el, div, () => {
        input.parentNode.insertBefore(div.children[0], input.nextSibling);
        meta.portal = _.get(
          cref.current,
          "_root.current.children.0.children.2"
        );
      });
    }
  }, []);

  return (
    <>
      <ComboBox
        {...props}
        onChange={onChange}
        componentRef={cref}
        autoComplete={"on"}
        allowFreeform={
          props.allowFreeForm === undefined ? true : props.allowFreeForm
        }
        useComboBoxAsMenuWidth={true}
        disabled={props.readonly}
        options={items}
      />
      {modifierList.length > 0 &&
        meta.portal &&
        createPortal(
          <>
            {modifierList.map((m) => {
              const onClick = () => {
                const mo = _.get(props, `modifier.${m}`);
                if (mo) {
                  mo(_.find(items, { key: props.selectedKey }), items);
                }
              };
              switch (m) {
                case "delete":
                  return (
                    <IconButton
                      onClick={onClick}
                      disabled={!props.selectedKey}
                      key={m}
                      styles={mbtnStyles("#9c5252")}
                      iconProps={{ iconName: "Trash" }}
                    />
                  );
                case "edit":
                  return (
                    <IconButton
                      onClick={onClick}
                      disabled={!props.selectedKey}
                      key={m}
                      styles={mbtnStyles("#52789c")}
                      iconProps={{ iconName: "Edit" }}
                    />
                  );
                case "add":
                  return (
                    <IconButton
                      onClick={onClick}
                      key={m}
                      styles={mbtnStyles("#529c62", {
                        marginLeft: 3,
                      })}
                      iconProps={{ iconName: "Add" }}
                    />
                  );
                case "view":
                  return (
                    <IconButton
                      onClick={onClick}
                      disabled={!props.selectedKey}
                      key={m}
                      styles={mbtnStyles("#9c4193")}
                      iconProps={{ iconName: "Link" }}
                    />
                  );
              }
            })}
          </>,
          meta.portal
        )}
    </>
  );
});
const mbtnStyles = (color, root?: any) => ({
  root: {
    ...root,
    width: 25,
    height: 25,
  },
  icon: {
    color: color,
    fontSize: 13,
  },
  rootPressed: {
    background: "transparent",
    opacity: 0.4,
  },
  rootDisabled: {
    background: "transparent",
    cursor: "pointer",
  },
  rootHovered: {
    background: "transparent",
  },
});
