import {
  ActionButton,
  DefaultButton,
  PrimaryButton,
} from "@fluentui/react/lib/Button";
import { useLocation } from "@reach/router";
import { startCase } from "@src/libs/utils";
import { generateDeleteString } from "@src/libs/utils/genDeleteString";
import { queryAll } from "@src/libs/utils/gql";
import { useWindowSize } from "@src/libs/utils/useWindowSize";
import _ from "lodash";
import { observer, useLocalStore } from "mobx-react-lite";
import * as React from "react";
import { columnDefs } from "..";
import { Text } from "../..";
import { ExportExcel } from "../../../utils/excel";
import Spinner from "../../Spinner";
import saveForm from "../utils/saveForm";

export default observer(
  ({
    parsed,
    mode,
    form,
    getList,
    getForm,
    setForm,
    colDef,
    isRoot,
    structure,
    reloadList,
    setLoading,
    setMode,
    auth,
    idKey,
    reload,
    style,
    hasRelation,
  }: any) => {
    const location = useLocation();
    const title = _.get(parsed, "title.children");
    let actions = _.get(parsed, "actions.children", []).filter((e) => !!e);
    if (!_.find(actions, { props: { type: "cancel" } })) {
      actions.push({ props: { type: "cancel" } });
    }
    const size = useWindowSize();
    const meta = useLocalStore(() => ({
      loading: false,
      shouldRefresh: false,
    }));

    actions = actions
      .map((e) => {
        switch (e.props.type) {
          case "create":
            if (mode === "") {
              return {
                key: "create",
                text: "Create",
                iconProps: { iconName: "Add" },
                onClick: () => {
                  setForm({});
                  setMode("create");
                },
              };
            }
            break;
          case "delete":
            if (mode === "edit") {
              return {
                key: "delete",
                text: "Delete",
                iconProps: { iconName: "Trash" },
                onClick: async () => {
                  if (window.confirm("Are you sure ?")) {
                    const q = generateDeleteString(structure, {
                      where: [
                        {
                          name: "id",
                          operator: "_eq",
                          value: form["id"],
                          valueType: "Int",
                        },
                      ],
                    });

                    setLoading(true);
                    let res = await queryAll(q.query, { auth, raw: true });
                    if (res.errors) {
                      setLoading(false);
                      const msg = res.errors
                        .map((e) => {
                          if (
                            _.get(e, "extensions.code") ===
                            "constraint-violation"
                          ) {
                            const table = _.trim(
                              e.message.split('" on table "')[1],
                              '"'
                            );
                            return `  • Please delete all rows on current ${startCase(
                              table
                            )}.`;
                          }
                          return `  • ${e.message}`;
                        })
                        .filter((e) => !!e);
                      alert("Delete failed: \n" + msg.join("\n"));
                      return false;
                    }
                    await reload();
                    setLoading(false);
                    setMode("");
                  }
                },
              };
            }
            break;
          case "cancel":
            if (mode !== "") {
              return {
                key: "cancel",
                text: "",
                iconProps: { iconName: "ChevronLeft" },
                onClick: () => {
                  if (isRoot && mode === "edit") {
                    const url = window.location.pathname;
                    const lastIdx = url.lastIndexOf("/");
                    const id = Number(url.substring(lastIdx + 1));
                    if (isNaN(id)) setMode("");
                    else window.history.back();
                  } else {
                    setMode("");
                    reloadList();
                  }
                },
              };
            }
            break;
          case "save":
            if (mode !== "") {
              return {
                key: "save",
                text: "Save",
                primary: true,
                iconProps: { iconName: "Save" },
                onClick: async () => {
                  const rawForm = getForm();
                  const form = rawForm.data;
                  const errors = rawForm.errors;
                  const afterSubmit = rawForm.afterSubmit;
                  const beforeSubmit = rawForm.beforeSubmit;
                  const setErrors = (v) => (rawForm.errors = v);

                  // validate form
                  const cdef: any = {};
                  columnDefs[structure.name].forEach((e) => {
                    cdef[e.column_name] = e;
                  });
                  const newerrs = {};
                  const ovrd = structure.overrideForm || {};
                  _.map(cdef, (f, k) => {
                    if (f && f.is_nullable === "NO" && !f.column_default) {
                      if (!form[k] && k !== "id" && !ovrd[k]) {
                        let name = startCase(k);
                        if (name.indexOf("Id") === 0) {
                          name = name.substr(3);
                        }
                        newerrs[k] = `${name} is required.`;
                      }
                    }
                  });

                  if (
                    Object.keys(newerrs).length !== Object.keys(errors).length
                  ) {
                    if (Object.keys(newerrs).length > 0) {
                      setErrors(newerrs);
                    }
                  }

                  //beforeSubmit
                  if (beforeSubmit !== undefined) {
                    if ((await beforeSubmit(form, rawForm.errors)) !== true) {
                      return;
                    }
                  }
                  if (Object.keys(newerrs).length === 0) {
                    saveForm({
                      mode,
                      form,
                      afterSubmit,
                      structure,
                      setLoading: (v) => {
                        setLoading(v);
                        meta.loading = v;
                      },
                      setForm,
                      setMode,
                      meta,
                      auth,
                      idKey,
                      reload,
                      hasRelation,
                    });
                    setErrors({});
                  }
                },
              };
            }
            break;
          case "custom":
            const text = e.props.children.props.children
              ? e.props.children.props.children
              : "Custom";
            const key =
              e.props.options && e.props.options.key
                ? e.props.options.key
                : "custom";
            const icon =
              e.props.options && e.props.options.icon
                ? e.props.options.icon
                : "Insert";
            const _mode =
              e.props.options && e.props.options.mode
                ? e.props.options.mode
                : "";
            if (mode == _mode) {
              return {
                key: key,
                text: text,
                primary: true,
                iconProps: { iconName: icon },
                onClick:
                  e.props.options && e.props.options.onClick
                    ? e.props.options.onClick
                    : () => {
                        console.log("custom clicked");
                      },
              };
            }
            break;
          case "excel":
            if (mode === "") {
              return {
                key: "excel",
                text: "Export Excel",
                iconProps: { iconName: "ExcelLogo" },
                onClick:
                  e.props.options && e.props.options.onClick
                    ? e.props.options.onClick
                    : () => {
                        const filename = e.props.options.filename;
                        ExportExcel({
                          data: getList(),
                          filename: filename ? filename : "excel-file",
                        });
                      },
              };
            }
            break;
          case "back":
            if (mode === "") {
              return {
                key: "back",
                text: "",
                iconProps: { iconName: "ChevronLeft" },
                onClick:
                  e.props.options && e.props.options.onClick
                    ? e.props.options.onClick
                    : () => {
                        // if (isRoot) {
                        window.history.back();
                        // }
                      },
              };
            }
            break;
        }
      })
      .filter((e) => !!e);

    const titleStyle =
      size.width < 800
        ? {
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "200px",
          }
        : {};

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          height: "50px",
          justifyContent: "space-between",
          ...style,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {actions
            .filter((e) => e.key === "cancel" || e.key === "back")
            .map((e) => (
              <ActionButton
                text={e.text}
                style={{ marginRight: -15 }}
                key={e.key}
                iconProps={e.iconProps}
                onClick={(ev) => {
                  if (e.onClick) {
                    e.onClick(ev, { reloadList: reload });
                  }
                }}
              />
            ))}
          {!!title && (
            <Text
              style={{
                padding: 10,
                fontSize: 21,
                fontWeight: 200,
                ...titleStyle,
              }}
            >
              {title}
            </Text>
          )}
        </div>
        <div>
          {meta.loading ? (
            <Spinner style={{ marginRight: 25 }} />
          ) : (
            <MenuButtons actions={actions} reload={reload} />
          )}
        </div>
      </div>
    );
  }
);

const MenuButtons = ({ actions, reload }: any) => {
  const size = useWindowSize();
  const buttons = actions.filter((e) => e.key !== "cancel" && e.key !== "back");
  if ((size.width > 800 && buttons.length <= 5) || buttons.length < 2)
    return (
      <>
        {buttons.map((e) => (
          <ActionButton
            text={e.text}
            key={e.key}
            iconProps={e.iconProps}
            onClick={(ev) => {
              if (e.onClick) {
                e.onClick(ev, { reloadList: reload });
              }
            }}
          />
        ))}
      </>
    );
  else {
    const items: any[] = [];
    let save: any = null;
    buttons.forEach((e) => {
      if (e.key === "save") {
        save = e;
      } else {
        items.push(e);
      }
    });

    return (
      <>
        {save ? (
          <>
            <ActionButton
              text={save.text}
              key={save.key}
              iconProps={save.iconProps}
              onClick={(ev) => {
                if (save.onClick) {
                  save.onClick(ev, { reloadList: reload });
                }
              }}
            />
            <DefaultButton
              style={{
                padding: "0px 5px",
                background: "#ececeb",
                fontSize: "14px",
                fontWeight: "normal",
                border: 0,
                borderLeft: "2px solid #1085D5",
                borderRadius: 0,
              }}
              text={`${items.length} Actions`}
              menuProps={{
                items,
              }}
            />
          </>
        ) : (
          <PrimaryButton
            style={{
              marginRight: 5,
              borderRadius: 0,
            }}
            text={`${items.length} Actions`}
            menuProps={{
              items,
            }}
          />
        )}
      </>
    );
  }
};
