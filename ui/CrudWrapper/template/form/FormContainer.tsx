import { useWindowSize } from "@src/libs/utils/useWindowSize";
import { observer, useObservable } from "mobx-react-lite";
import * as React from "react";
import SplitPane from "react-split-pane";
import FormBody from "./FormBody";
import SubForm from "./SubForm";
import _ from "lodash";

export default observer(
  ({ mode, fields, formRef, data, auth, parsed, events, isRoot, enableSub }: any) => {
    const localSize = localStorage["cactiva-app-split-size"] || "44";
    const meta = useObservable({
      size: isRoot ? localSize : "44",
      subs: {},
      resizing: false,
      resizeTimer: 0 as any,
    });

    const conRef = React.useRef(null as any);
    const size = useWindowSize();
    const rels = Object.keys(fields.relations);
    return mode === "create" || (rels.length === 0 && enableSub !== true) ? (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "auto",
        }}
      >
        <FormBody
          parsed={parsed}
          data={data}
          fields={fields}
          formRef={formRef}
          events={events}
        />
      </div>
    ) : size.width > 800 ? (
      <SplitPane
        split="horizontal"
        maxSize={0}
        minSize={44}
        ref={conRef}
        resizerStyle={{
          borderTop: "1px solid #ccc",
          paddingTop: 1,
          background: parseInt(meta.size) <= 50 ? "#fafafa" : "white",
          cursor: "row-resize",
        }}
        className="sub-pane-box"
        primary="second"
        onChange={(size) => {
          if (meta.resizeTimer) {
            clearTimeout(meta.resizeTimer);
          }
          meta.resizing = true;
          if (size <= 50) {
            meta.size = "44";
          } else {
            meta.size = size.toString();
          }
          if (isRoot) {
            localStorage["cactiva-app-split-size"] = meta.size;
          }
          meta.resizeTimer = setTimeout(() => {
            meta.resizing = false;
          }, 300);
        }}
        size={meta.size + "px"}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            overflow: "auto",
          }}
        >
          <FormBody
            parsed={parsed}
            data={data}
            fields={fields}
            formRef={formRef}
            events={events}
          />
        </div>
        <SubForm
          fields={fields}
          auth={auth}
          height={parseInt(meta.size)}
          minimize={() => {
            meta.size = "40";
            if (isRoot) {
              localStorage["cactiva-app-split-size"] = meta.size;
            }
          }}
          restore={() => {
            const h = _.get(conRef, "current.splitPane.offsetHeight");
            if (h) {
              meta.size = h / 2;

              if (isRoot) {
                localStorage["cactiva-app-split-size"] = meta.size;
              }
            }
          }}
          maximize={() => {
            const h = _.get(conRef, "current.splitPane.offsetHeight");
            if (h) {
              meta.size = h;
              if (isRoot) {
                localStorage["cactiva-app-split-size"] = meta.size;
              }
            }
          }}
        />
      </SplitPane>
    ) : (
      <>
        <div
          style={{
            flexGrow: 1,
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: 10,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: "auto",
            }}
          >
            <FormBody
              parsed={parsed}
              data={data}
              fields={fields}
              formRef={formRef}
              events={events}
            />
          </div>
        </div>
        <SubForm fields={fields} auth={auth} />
      </>
    );
  }
);
