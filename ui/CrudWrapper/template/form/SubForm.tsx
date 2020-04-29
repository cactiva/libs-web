import Select from "@src/libs/ui/Select";
import { useWindowSize } from "@src/libs/utils/useWindowSize";
import { observer, useObservable } from "mobx-react-lite";
import { IconButton } from "office-ui-fabric-react/lib/Button";
import { Label } from "office-ui-fabric-react/lib/Label";
import { Pivot, PivotItem } from "office-ui-fabric-react/lib/Pivot";
import * as React from "react";
import * as ReactDOM from "react-dom";
import _ from "lodash";
import { idKey } from "../..";
import Base from "../Base";

export default observer(
  ({ fields, auth, maximize, minimize, restore, height }: any) => {
    const meta = useObservable({
      selectedKey: "",
      pivotEl: null as any,
    });
    const size = useWindowSize();
    const baseRef = React.useRef(null as any);
    const relationKeys = Object.keys(fields.relations);
    const children = relationKeys.map((e, key) => {
      const rel = fields.relations[e];
      const sub: any = rel.sub;

      if (!sub || (sub && !sub.parsed)) {
        return null;
      }
      return (
        <PivotItem
          key={e}
          className="sub-form-pivot"
          headerText={rel.column.props.label}
          headerButtonProps={{
            "data-order": key,
            "data-title": rel.column.props.label,
          }}
        >
          <SubBase sub={sub} auth={auth} />
        </PivotItem>
      );
    });

    fields.subs.forEach((e) => {
      relationKeys.push(e.props.label);
      children.push(
        <PivotItem
          key={e.props.label}
          className="sub-form-pivot"
          headerText={e.props.label}
          headerButtonProps={{
            "data-order": children.length,
            "data-title": e.props.label,
          }}
        >
          {e.props.children}
        </PivotItem>
      );
    });

    const pivotRef = React.useRef(null as any);
    React.useEffect(() => {
      if (pivotRef.current && baseRef.current) {
        const el = baseRef.current.getElementsByClassName(
          pivotRef.current._classNames.root
        );
        if (el && el.length > 0) {
          meta.pivotEl = el[0];
        }
      }
    }, [pivotRef.current, height]);

    if (size.width > 800) {
      if (height <= 50) {
        if (children.length >= 0) {
          return (
            <div className="base-form-sub-min">
              {children.map((e, i) => {
                const title = _.get(e, "props.headerText");
                const key = parseInt(meta.selectedKey) || 0;
                return (
                  <div
                    key={i}
                    className={`sub-tab ${key === i ? "active" : ""}`}
                    onClick={() => {
                      meta.selectedKey = i + "";
                      restore();
                    }}
                  >
                    <Label> {title} </Label>
                  </div>
                );
              })}
            </div>
          );
        }
      }

      return (
        <div className="base-form-sub" ref={baseRef}>
          {meta.pivotEl &&
            ReactDOM.createPortal(
              <div className="sub-head">
                <IconButton
                  title="Minimize"
                  onClick={minimize}
                  styles={{ icon: { color: "#777" } }}
                  iconProps={{ iconName: "Download", color: "#777" }}
                />
                <IconButton
                  title="Restore"
                  onClick={restore}
                  styles={{ icon: { color: "#777" } }}
                  iconProps={{
                    iconName: "GripperBarHorizontal",
                    color: "#777",
                  }}
                />
                <IconButton
                  title="Maximize"
                  onClick={maximize}
                  styles={{ icon: { color: "#777" } }}
                  iconProps={{ iconName: "Upload" }}
                />
              </div>,
              meta.pivotEl
            )}

          <Pivot
            defaultSelectedIndex={parseInt(meta.selectedKey) || 0}
            componentRef={pivotRef}
            className="sub-tabs"
            styles={{ itemContainer: { flex: 1, display: "flex" } }}
            onLinkClick={(e: any, idx) => {
              meta.selectedKey = _.get(e, "props.headerButtonProps.data-order");
            }}
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "row",
              borderRight: "1px solid #ececeb",
              alignItems: "stretch",
            }}
          >
            {children}
          </Pivot>
        </div>
      );
    } else {
      const items = relationKeys.map((e, idx) => {
        const rel = fields.relations[e];
        if (rel) {
          const label = rel.column.props.label;
          return {
            value: idx.toString(),
            label,
          };
        } else {
          return {
            value: idx.toString(),
            label: e,
          };
        }
      });
      return (
        <div
          className={`mobile-form-sub ${!!meta.selectedKey ? "maximized" : ""}`}
        >
          <div className={`title`}>
            <Select
              placeholder="Sub Data..."
              items={items}
              style={{ flex: 1 }}
              allowFreeForm={false}
              selectedKey={meta.selectedKey}
              onChange={(e, item) => {
                meta.selectedKey = item.key;
              }}
            />
            {!!meta.selectedKey && (
              <IconButton
                onClick={() => {
                  meta.selectedKey = "";
                }}
                style={{ marginLeft: 5, padding: 0, minWidth: 40 }}
                iconProps={{
                  iconName: "MiniContract",
                  style: {
                    fontSize: 20,
                  },
                }}
              />
            )}
          </div>
          {!!meta.selectedKey && (
            <div
              style={{
                flex: 1,
                position: "relative",
                marginTop: 10,
                display: "flex",
                marginLeft: -10,
                marginRight: -10,
                borderTop: "1px solid #ccc",
              }}
            >
              {children[parseInt(meta.selectedKey)]}
            </div>
          )}
        </div>
      );
    }
  }
);

const SubBase = observer(({ sub, auth }: any) => {
  const meta = useObservable({
    mode: "",
  });
  const size = useWindowSize();
  const style =
    size.width < 800
      ? {}
      : { flexDirection: meta.mode === "" ? "column" : "row" };
  const headerStyle =
    size.width < 800
      ? meta.mode === ""
        ? {
            position: "fixed",
            bottom: 10,
            right: 10,
            width: 85,
            zIndex: 99,
            borderRadius: 5,
            boxShadow: "0 0 5px 0 rgba(0,0,0,.3)",
            background: "white",
          }
        : {}
      : meta.mode === ""
      ? {
          position: "absolute",
          right: 10,
          top: -5,
          zIndex: 99,
        }
      : {
          flexDirection: "column",
          height: "100%",
          justifyContent: "flex-start",
        };
  return (
    <Base
      structure={sub.structure}
      auth={auth}
      isRoot={false}
      parsed={{
        ...sub.parsed,
        title: { children: meta.mode === "" ? "" : sub.parsed.title.children },
      }}
      idKey={idKey}
      mode={meta.mode}
      style={style}
      headerStyle={headerStyle}
      setMode={(v) => (meta.mode = v)}
    />
  );
});
