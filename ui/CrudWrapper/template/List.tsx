import { navigate, useLocation } from "@reach/router";
import { formatMoney } from "@src/libs/utils";
import { dateFormat } from "@src/libs/utils/date";
import _ from "lodash";
import { toJS } from "mobx";
import { observer, useObservable } from "mobx-react-lite";
import {
  ColumnActionsMode,
  ConstrainMode,
  DetailsList,
  DetailsListLayoutMode,
} from "office-ui-fabric-react/lib/DetailsList";
import { SelectionMode } from "office-ui-fabric-react/lib/Selection";
import { Spinner } from "office-ui-fabric-react/lib/Spinner";
import { Label } from "office-ui-fabric-react/lib/Label";
import * as React from "react";
import useAsyncEffect from "use-async-effect";
import NiceValue from "../../Field/NiceValue";
import { formatRelationLabel } from "./fields/SelectFk";
import Filter from "./filter";
import Loading from "./Loading";
import Empty from "./Empty";
import FileUpload from "./fields/FileUpload";
import { queryUpdate } from "@src/libs/utils/gql";
import { useWindowSize } from "@src/libs/utils/useWindowSize";
import { List, Icon } from "office-ui-fabric-react";
import { waitUntil } from "./Base";

export const DEFAULT_COLUMN_WIDTH = 160;
export default observer(
  ({
    table,
    reload,
    setForm,
    setScroll,
    scroll,
    list,
    loading,
    auth,
    filter,
    colDef,
    fkeys,
    setMode,
    isRoot,
    structure,
  }: any) => {
    const size = useWindowSize();
    const location = useLocation();
    const isMobile = size.width > 800 ? false : true;
    const isEmpty = !(list && list.length > 0);
    const isLoading = Object.keys(colDef).length === 0 || loading;
    const meta = useObservable({
      columns: [],
      more: [] as any,
    });
    const onClick = (item) => {
      setForm(item);
      if (isRoot && item.id && location.state) {
        window.history.pushState(
          {},
          "",
          `${(location.state as any).path}/${item.id}`
        );
      }
      setMode("edit");
    };
    useAsyncEffect(async () => {
      meta.columns = generateColumns(structure, table, colDef, fkeys);
    }, [structure]);

    const columns = meta.columns;
    const dref = React.useRef(null);
    React.useEffect(() => {
      waitUntil(() => _.get(dref, "current._root.current")).then(() => {
        const el = _.get(dref, "current._root.current");
        if (el) {
          const grid = isMobile ? el : el.children[0];
          grid.scrollTop = scroll.top;
          grid.scrollLeft = scroll.left;

          let trycount = 0;
          let tryset: any = setInterval(() => {
            grid.scrollTop = scroll.top;
            grid.scrollLeft = scroll.left;
            trycount++;

            if (
              trycount > 100 ||
              (scroll.top === grid.scrollTop && scroll.left === grid.scrollLeft)
            )
              clearInterval(tryset);
          }, 10);
          grid.onscroll = (e) => {
            if (tryset) {
              clearInterval(tryset);
              tryset = undefined;
            }
            e.target.children[0].style.top = e.target.scrollTop + "px";
            setScroll({
              top: e.target.scrollTop,
              left: e.target.scrollLeft,
            });
          };
        }
      });
    }, [dref.current]);

    return (
      <>
        {!isMobile && (
          <Filter
            filter={filter}
            reload={reload}
            columns={columns}
            structure={structure}
            auth={auth}
            colDef={colDef}
            fkeys={fkeys}
          />
        )}

        <div style={{ flex: 1, position: "relative", display: "flex" }}>
          <div className="base-list">
            {isLoading ? (
              <Loading text={"Fetching Data "} />
            ) : isEmpty ? (
              <Empty text={"Data Empty"} />
            ) : isMobile ? (
              <List
                items={list || []}
                componentRef={dref}
                onShouldVirtualize={(e: any) => {
                  return true;
                }}
                version={meta.more}
                onRenderCell={(item: any, idx?: number) => {
                  const id = item["id"];
                  console.log(meta.more.indexOf(id));
                  return (
                    <div
                      className={`mobile-list-item ${
                        meta.more.indexOf(id) >= 0 ? "expanded" : ""
                      }`}
                    >
                      <div
                        className="outer"
                        onClick={() => {
                          onClick(toJS(item));
                        }}
                      >
                        <div className="inner">
                          {meta.more.indexOf(id) >= 0
                            ? meta.columns.map((e: any, idx: number) => {
                                const v = e.onRender(item);
                                return (
                                  <Label key={idx}>
                                    <div className="label">{e.name}</div>
                                    <span className="sep">:</span>
                                    <div className="value">{!v ? "-" : v}</div>
                                  </Label>
                                );
                              })
                            : meta.columns.map((e: any, idx: number) => {
                                if (idx <= 2) {
                                  return (
                                    <Label key={idx}> {e.onRender(item)}</Label>
                                  );
                                }
                              })}
                        </div>
                        <Icon
                          style={{ fontSize: 25, color: "#aaa" }}
                          iconName="ChevronRight"
                        />
                      </div>
                      {meta.more.indexOf(id) < 0 && (
                        <div
                          className="expand"
                          onClick={() => {
                            if (meta.more.indexOf(id) < 0) {
                              meta.more = [...meta.more, id];
                            }
                          }}
                        >
                          <Icon
                            style={{ fontSize: 25, color: "#aaa" }}
                            iconName="More"
                          />
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            ) : (
              <DetailsList
                constrainMode={ConstrainMode.horizontalConstrained}
                disableSelectionZone={true}
                componentRef={dref}
                selectionMode={SelectionMode.single}
                items={list || []}
                onShouldVirtualize={(e: any) => {
                  return true;
                }}
                onRenderDetailsHeader={(
                  detailsHeaderProps?: any,
                  defaultRender?: any
                ) => {
                  return defaultRender ? (
                    defaultRender(detailsHeaderProps)
                  ) : (
                    <div></div>
                  );
                }}
                onRenderRow={(detailsRowProps?: any, defaultRender?: any) => (
                  <>
                    <div
                      onClick={() => {
                        if (detailsRowProps) {
                          const item = toJS(detailsRowProps.item);
                          onClick(item);
                        }
                      }}
                    >
                      {defaultRender && defaultRender(detailsRowProps)}
                    </div>
                  </>
                )}
                layoutMode={DetailsListLayoutMode.fixedColumns}
                onRenderCheckbox={() => {
                  return null;
                }}
                columns={columns}
              />
            )}
          </div>
        </div>
      </>
    );
  }
);

const generateColumns = (structure, table, colDef, fkeys) => {
  const keys = {};
  _.forEach(table.head.children, (e) => {
    keys[e.props.path] = e;
  });

  _.forEach(structure.fields, (e) => {
    if (!keys[e.name]) {
      keys[e.name] = {
        props: { path: e.name },
      };
    }
  });

  const hidden: any = [];
  const indexed = {};
  const cols = table.head.children
    .map((e, idx) => {
      if (indexed[e.props.path]) return false;
      indexed[e.props.path] = true;

      let relation: any = undefined;
      if (e.props.relation) {
        relation = e.props.relation;

        if (!relation.alias && fkeys) {
          const fk = fkeys[e.props.path];
          const sname = structure.originalName || structure.name;
          if (fk && fk.table_name === sname) {
            const tablename = fk.foreign_table_name;
            const key: any = keys[tablename] || keys[tablename + "s"];
            if (key) {
              relation.alias = key.props.path;
            }
          }
        }
      } else if (!e.props.relation && fkeys) {
        const fk = fkeys[e.props.path];
        const sname = structure.originalName || structure.name;
        if (fk && (fk.table_name === sname || fk.alias === sname)) {
          const tablename = fk.foreign_table_name;
          const key: any = keys[tablename] || keys[tablename + "s"];
          if (key) {
            hidden.push(key.props.path);

            const sfield = _.find(structure.fields, { name: key.props.path });
            if (sfield) {
              relation = {
                alias: key.props.path,
                label: (item, colDef) => {
                  const skeys: any = [];
                  sfield.fields.forEach((k) => {
                    skeys.push(k.name);
                  });
                  return formatRelationLabel(
                    skeys,
                    item[key.props.path],
                    colDef
                  );
                },
              };
            } else {
              relation = {
                alias: key.props.path,
                label: (item, colDef) => {
                  return formatRelationLabel(Object.keys(keys), item, colDef);
                },
              };
            }
          }
        }
      }

      let title = e.props.title;
      if (title && title.toLowerCase().indexOf("id") === 0)
        title = title.substr(3);
      return {
        ...e.props,
        title,
        relation,
        children: _.get(
          table,
          `row.children.${idx}.props.children`,
          _.get(table, `head.children.${idx}.props.children`)
        ),
      };
    })
    .filter((e) => !!e && hidden.indexOf(e.path) < 0);

  return cols.map((e: any, k: any) => {
    const fk = fkeys[e.path];
    let relation = e.relation;
    if (fk && !relation) {
      relation = {
        from: {
          table: fk.foreign_table_name,
        },
      };
    }
    return {
      key: e.path,
      name: e.title,
      relation: relation,
      filter: e.filter,
      maxWidth: e.width || DEFAULT_COLUMN_WIDTH,
      isResizable: !e.width ? true : false,
      columnActionsMode: ColumnActionsMode.disabled,
      onRender: (item: any) => {
        const renderValue = () => {
          if (typeof e.children === "function") {
            return e.children(_.get(item, e.path), item);
          }
          const value = _.get(item, e.path);
          const labelFunc = _.get(e, "options.label");
          if (typeof labelFunc === "function") {
            return labelFunc(value, item, { path: e.path, idx: k });
          }

          const cdef = colDef[e.path];
          let valueEl: any = null;
          if (e.path.indexOf(".") > 0) {
            return formatValue(value);
          }

          if (e.relation) {
            const alias = e.relation.alias;
            if (typeof e.relation.label === "function") {
              valueEl = formatValue(e.relation.label(item, colDef[alias]));
            } else if (alias) {
              valueEl = formatValue(item[alias]);
            }
          } else if (cdef) {
            if (
              cdef.data_type.indexOf("numeric") >= 0 ||
              cdef.data_type.indexOf("double precision") >= 0 ||
              cdef.data_type.indexOf("decimal") >= 0
            ) {
              valueEl = formatMoney(value);
            } else if (
              cdef.data_type.indexOf("timestamp") >= 0 ||
              cdef.data_type === "date"
            ) {
              valueEl = dateFormat(value);
            } else {
              valueEl = formatValue(value);
            }
          } else {
            return formatValue(value);
          }

          return valueEl;
        };

        const value = _.get(item, e.path);
        if (value && (e.prefix || e.suffix)) {
          return (
            <div
              style={{
                display: "flex",
                width: "100%",
                border: "1px solid #ddd",
                padding: "0px 5px",
                borderRadius: 3,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {e.prefix && (
                <div style={{ marginRight: 5, fontSize: 12 }}>{e.prefix}</div>
              )}
              {renderValue()}
              {e.suffix && (
                <div style={{ marginLeft: 5, fontSize: 12 }}>{e.suffix}</div>
              )}
            </div>
          );
        }

        if (e.path.indexOf("file") === 0) {
          return (
            <FileUpload
              table={structure.name}
              field={e.path}
              value={value}
              onChange={async (newvalue) => {
                if (item.id) {
                  const data: any = {};
                  data["id"] = item.id;
                  data[e.path] = newvalue;
                  await queryUpdate(structure.name, data);
                }
              }}
            />
          );
        }

        return renderValue();
      },
    };
  });
};

const formatValue = (value) => {
  if (typeof value === "string") {
    return value;
  } else if (typeof value === "object") {
    return <NiceValue value={value} />;
  } else if (typeof value === "number") {
    return value;
  }
};
