import { useWindowSize } from "@src/libs/utils/useWindowSize";
import { observer, useObservable } from "mobx-react-lite";
import * as React from "react";
import SplitPane from "react-split-pane";
import FormBody from "./FormBody";
import SubForm from "./SubForm";

export default observer(
  ({ mode, fields, formRef, data, auth, parsed, events }: any) => {
    const meta = useObservable({
      size: localStorage["cactiva-app-split-size"] || "200",
      subs: {},
      resizing: false,
      resizeTimer: 0 as any,
    });

    const size = useWindowSize();
    const rels = Object.keys(fields.relations);
    return mode === "create" || rels.length === 0 ? (
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
    ) : size.width > 800 ? (
      <SplitPane
        split="horizontal"
        maxSize={0}
        resizerStyle={{ borderTop: "3px double #ccc", cursor: "row-resize" }}
        primary="second"
        onChange={(size) => {
          if (meta.resizeTimer) {
            clearTimeout(meta.resizeTimer);
          }
          meta.resizing = true;
          meta.size = size.toString();
          meta.resizeTimer = setTimeout(() => {
            meta.resizing = false;
            localStorage.setItem("cactiva-app-split-size", meta.size);
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
            padding: 10,
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
        <SubForm fields={fields} auth={auth} />
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
