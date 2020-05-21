import { CrudWrapper, Table, TableColumn, TableHead, Text } from "@src/libs/ui";
import { startCase } from "@src/libs/utils";
import { dateFormat } from "@src/libs/utils/date";
import { generateQueryString } from "@src/libs/utils/genQueryString";
import { querySingle } from "@src/libs/utils/gql";
import { parseTable, useCrud } from "@src/libs/utils/useCrud";
import gql from "graphql-tag";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import { Modal } from "office-ui-fabric-react";
import { ContextualMenu } from "office-ui-fabric-react/lib/ContextualMenu";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import * as React from "react";
import useAsyncEffect from "use-async-effect";
import { columnDefs } from "../..";
import { loadColDefs } from "../../utils/reloadStructure";
import { waitUntil } from "../Base";

export default observer((props: any) => {
  const meta = useObservable({
    label: "Loading...",
    rawQuery: "",
    query: "",
    show: false,
  });

  meta.rawQuery = getQuery(props);
  useAsyncEffect(async () => {
    if (!meta.query) {
      meta.query = await parseQuery(meta.rawQuery, props.tablename);
    }
    if (props.value) {
      const res = await loadValue(meta.query, props.value);
      if (res) {
        meta.label = formatRelationLabel(Object.keys(res), res);
      } else {
        console.log(res, props);
      }
    } else {
      meta.label = "";
    }
  }, [props.value, meta.rawQuery]);

  return (
    <>
      <TextField
        value={meta.label}
        label={props.label}
        spellCheck={false}
        styles={props.styles}
        onClick={() => (meta.show = true)}
        className="select-fk"
        iconProps={{
          iconName: "ChevronDown",
          style: {
            fontSize: "11px",
          },
        }}
      />
      {meta.show && (
        <FkPicker
          query={meta.query}
          label={props.label}
          value={props.value}
          page={props.relationPage}
          onSelect={(item) => {
            if (item && item["id"]) {
              props.onChange(item["id"]);
            }
            meta.show = false;
          }}
          onDismiss={() => {
            meta.show = false;
          }}
        />
      )}
    </>
  );
});

const FkPicker = observer(
  ({ query, label, onSelect, onDismiss, value, page }: any) => {
    const meta = useObservable({
      crud: {} as any,
      fields: [] as any[],
    });

    useCrud(meta, "crud", query);

    React.useEffect(() => {
      waitUntil(() => document.querySelector(".fk-modal")).then(() => {
        const modal = document.querySelector(".fk-modal");
        if (modal) {
          const sc = modal.querySelector(".ms-Modal-scrollableContent");
          sc?.removeAttribute("data-is-scrollable");
        }

        const table = getTable(query);
        meta.fields = [];

        if (_.find(table.fields, { name: "name" })) {
          meta.fields.push({ path: "name", title: "Name" });
        }

        table.fields.forEach((e, idx) => {
          if (e.name.indexOf("name") > 0) {
            meta.fields.push({ path: e.name, title: startCase(e.name) });
          }
        });

        table.fields.forEach((e, idx) => {
          if (
            ["id", "name"].indexOf(e.name) >= 0 ||
            _.find(meta.fields, { path: e }) ||
            meta.fields.length > 6
          ) {
            return;
          }

          meta.fields.push({ path: e.name, title: startCase(e.name) });
        });
      });
    }, [query]);

    const PageComponent = page;
    return (
      <Modal
        className={`fk-modal fk-col-${
          meta.fields.length > 4 ? "s" : meta.fields.length
        } ${meta.fields.length === 0 ? "loading" : ""}`}
        isOpen={true}
        onDismiss={onDismiss}
        isDarkOverlay={false}
      >
        <div className="fk-popup">
          {meta.fields.length > 0 &&
            (page ? (
              <PageComponent
                isPopup={true}
                selectedId={value}
                onRowClick={(e) => {
                  onSelect(e);
                }}
              />
            ) : (
              <CrudWrapper data={meta.crud} isRoot={false}>
                <Text>{label}</Text>
                <Table
                  columnMode={"manual"}
                  selectedId={value}
                  onRowClick={(e) => {
                    onSelect(e);
                  }}
                >
                  <TableHead>
                    {meta.fields.map((e, idx) => {
                      return (
                        <TableColumn
                          key={idx}
                          path={e.path}
                          title={e.title}
                        ></TableColumn>
                      );
                    })}
                  </TableHead>
                </Table>
              </CrudWrapper>
            ))}
        </div>
      </Modal>
    );
  }
);

export const formatRelationLabel = (keys, e, colDef?) => {
  let usedKeys = keys;

  if (keys.length > 5) {
    usedKeys = keys.filter((f) => {
      if (f.indexOf("name") >= 0) {
        return true;
      }
      return false;
    });
  } else {
    if (usedKeys.length === 0) {
      for (let i in keys) {
        if ((i as any) * 1 <= 5) usedKeys.push(keys[i]);
      }
    }
  }

  return _.trim(
    usedKeys
      .filter((f) => f !== "id")
      .map((f) => {
        return formatSingleString(e, f, _.get(colDef, "columns"));
      })
      .join(" • ")
      .replace(/ •  • /gi, " • "),
    " • "
  );
};

const formatSingleString = (e, f, cdef) => {
  if (!e) return "";
  if (typeof e[f] === "object" && e[f] !== null) {
    const kef = Object.keys(e[f]);
    return kef
      .map((k) => {
        if (typeof e[f][k] === "object") {
          return formatSingleString(e[f], k, _.get(cdef, k));
        }
        return e[f][k];
      })
      .join(" • ");
  }
  const cd = _.get(cdef, f);
  if (cd) {
    const type = cd.data_type;
    switch (type) {
      case "timestamp without time zone":
      case "timestamp with time zone":
        return dateFormat(e[f]);
      case "date":
        return dateFormat(e[f], "dd MMM yyyy");
    }
  }

  return e && e[f];
};

const getQuery = (props) => {
  const { tablename, relation } = props;
  let query = "";
  if (relation && relation.query) {
    if (typeof relation.query === "function") {
      query = relation.query();
    } else {
      query = relation.query;
    }
  } else {
    query = ":::" + tablename;
  }
  return query;
};

const parseQuery = async (query, tablename) => {
  if (query.indexOf(":::") === 0) {
    await loadColDefs(tablename);
    const cols = columnDefs[tablename];
    if (cols) {
      query = `query { ${tablename} {
                    id
                    ${cols
                      .map((e) => e.column_name)
                      .filter((e) => e !== "id" && e.indexOf("id") !== 0)
                      .join("\n")}
                }}`;
    }
  }

  return query;
};

const getTable = (query) => {
  const q = gql`
    ${query}
  `;
  const root = _.get(q, `definitions.0.selectionSet.selections.0`);
  const table: any = parseTable(root);
  return table;
};

const loadValue = async (query, id) => {
  const table = getTable(query);
  table.where = [
    {
      name: "id",
      operator: "_eq",
      valueType: "IntValue",
      value: id,
    },
  ];
  const result = await querySingle(generateQueryString(table, true));

  if (!result) {
    console.log(generateQueryString(table, true));
  }

  return result;
};
