import { observer, useObservable } from "mobx-react-lite";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { Label } from "office-ui-fabric-react/lib/Label";
import { Spinner } from "office-ui-fabric-react/lib/Spinner";
import React, { useRef } from "react";
import Axios from "axios";
import session from "@src/stores/session";
import { alert } from "@src/Main";
const config = require("@src/settings.json");

export default observer(
  (props: {
    field: string;
    table: string;
    label?: string;
    value?: string;
    enableUpload?: boolean;
    onChange?;
  }) => {
    const fileRef = useRef(null as any);
    const meta = useObservable({
      uploading: false,
      percent: 0,
      value: props.value,
    });
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Label>{props.label}</Label>

        {meta.uploading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              fontSize: "10px",
              padding: 5,
            }}
          >
            <Spinner style={{ marginRight: 5 }} /> Uploading ({meta.percent}%)
          </div>
        ) : !meta.value ? (
          props.enableUpload === undefined ||
          (props.enableUpload === true && (
            <DefaultButton
              onClick={() => {
                fileRef.current.click();
              }}
              iconProps={{ iconName: "Upload" }}
            >
              Upload
            </DefaultButton>
          ))
        ) : (
          <DefaultButton
            split
            iconProps={{ iconName: "Download" }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const url = `${config.backend.protocol}://${config.backend.host}:${config.backend.port}/repo/`;
              window.open(url + meta.value, "_blank");
            }}
            menuProps={
              props.onChange && (props.enableUpload === undefined || props.enableUpload)
                ? {
                    items: [
                      {
                        key: "upload",
                        text: "Replace File",
                        iconProps: { iconName: "Upload" },
                        onClick: () => {
                          fileRef.current.click();
                        },
                      },
                    ],
                  }
                : undefined
            }
          >
            Download
          </DefaultButton>
        )}
        <input
          ref={fileRef}
          style={{ display: "none" }}
          type="file"
          onChange={(ev) => {
            meta.uploading = true;
            const url = `${config.backend.protocol}://${config.backend.host}:${config.backend.port}/upload`;
            var formData = new FormData();
            formData.append("files", (ev.target as any).files[0]);
            formData.append("path", `${props.field}/${props.table}`);
            Axios.post(url, formData, {
              onUploadProgress: function (progressEvent) {
                var percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                meta.percent = percentCompleted;
              },
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${session.jwt}`,
              },
            })
              .catch((e) => {
                alert(e);
                meta.uploading = false;
              })
              .then((e: any) => {
                meta.percent = 100;
                meta.uploading = false;
                meta.value = e.data.path;
                if (props.onChange) {
                  props.onChange(meta.value);
                }
              });
          }}
          onClick={(ev) => {
            (ev.target as any).value = "";
          }}
        />
      </div>
    );
  }
);
