import _ from "lodash";
import { toJS } from "mobx";
import { observer, useObservable } from "mobx-react-lite";
import { IconButton } from "office-ui-fabric-react/lib/Button";
import { Callout } from "office-ui-fabric-react/lib/Callout";
import { Checkbox } from "office-ui-fabric-react/lib/Checkbox";
import React, { useEffect, useRef } from "react";
import { argsApplyFilter } from "../../utils/argsApplyFilter";
import { argsLoadFilter } from "../../utils/argsLoadFilter";
import { argsSetFilter } from "../../utils/argsSetFilter";
import FilterBoolean from "./FilterBoolean";
import FilterDate from "./FilterDate";
import FilterDecimal from "./FilterDecimal";
import FilterInteger from "./FilterInteger";
import FilterMoney from "./FilterMoney";
import FilterRelation from "./FilterRelation";
import FilterSelect from "./FilterSelect";
import FilterString from "./FilterString";

export default observer((props: any) => {
  const { reload, filter, columns, colDef, fkeys, structure, auth } = props;
  const meta = useObservable({
    show: false,
    visibles: {},
    init: false,
    columns: [] as any,
  });
  useEffect(() => {
    meta.columns = _.cloneDeep(columns);
    if (structure.args) {
      argsApplyFilter(structure, meta.columns, filter.form);
    }
    if (meta.columns.length > 1) {
      for (let i = 0; i < 4; i++) {
        if (i < meta.columns.length) {
          const e = meta.columns[i];
          if (e) {
            meta.visibles[e.key] = true;
          }
        }
      }
    } else {
      for (let i = 0; i < meta.columns.length; i++) {
        const e = meta.columns[i];
        meta.visibles[e.key] = true;
      }
    }
  }, [columns]);
  const btnRef = useRef(null);

  return (
    <div
      className="filter-container"
      style={{
        overflowX: "auto",
        overflowY: "hidden",
        height: "45px",
        position: "relative",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          position: "absolute",
          left: 0,
          bottom: 0,
          right: 0,
          top: 0,
        }}
      >
        <div ref={btnRef}>
          <IconButton
            onClick={() => (meta.show = true)}
            iconProps={{ iconName: "GlobalNavButton" }}
          />
        </div>
        {meta.columns.map((e, key) => {
          if (meta.visibles[e.key]) {
            let result:any = null;
            let type = _.get(colDef, `${e.key}.data_type`);
            if (e.key.indexOf(".") > 0) {
              const eks = e.key.split(".").join(".columns.");
              type = _.get(colDef, `${eks}.data_type`);
              if (!type) console.log(toJS(colDef), eks);
            }

            const submit = () => {
              reload();
            };
            let value = filter.form[e.key];
            if (e._args) {
              value = argsLoadFilter(e, filter);
            }

            const setValue = (newvalue) => {
              if (e._args) {
                argsSetFilter(e, filter, newvalue);
              } else {
                let key = e.key;
                if (!type && !fkeys[e.key] && e.relation && e.relation.alias) {
                  key = e.relation.alias;
                }
                if (!newvalue) {
                  delete filter.form[key];
                } else filter.form[key] = newvalue;
              }
            };

            if (e.filter) {
              type = e.filter.type;
            }

            if (e.relation) {
              const alias = e.relation.alias;
              if (alias) {
                let tablename = "";
                let relSetValue = setValue;
                let key: any = [e.key];
                if (!type && !fkeys[e.key] && e.relation && e.relation.alias) {
                  key = e.relation.alias;
                }

                if (fkeys[e.key]) {
                  tablename = fkeys[e.key].foreign_table_name;
                } else if (colDef[e.key] && colDef[e.key].fk) {
                  tablename = colDef[e.key].fk.foreign_table_name;
                  key = colDef[e.key].fk.column_name;
                  relSetValue = (newvalue) => {
                    if (!newvalue) {
                      delete filter.form[key];
                    } else filter.form[key] = newvalue;
                  };
                }

                result = (
                  <FilterRelation
                    setValue={relSetValue}
                    submit={submit}
                    value={filter.form[key]}
                    key={key}
                    structure={structure}
                    auth={auth}
                    tablename={tablename}
                    relation={e.relation}
                    alias={alias}
                    field={e.key}
                    label={e.name}
                  />
                );
              }
            } else {
              switch (type) {
                case "character varying":
                case "text":
                  result = (
                    <FilterString
                      setValue={setValue}
                      submit={submit}
                      value={value}
                      key={key}
                      field={e.key}
                      label={e.name}
                    />
                  );
                  break;
                case "integer":
                  result = (
                    <FilterInteger
                      setValue={setValue}
                      submit={submit}
                      key={key}
                      value={value}
                      field={e.key}
                      label={e.name}
                    />
                  );
                  break;
                case "numeric": // money
                  result = (
                    <FilterMoney
                      setValue={setValue}
                      submit={submit}
                      key={key}
                      value={value}
                      field={e.key}
                      label={e.name}
                    />
                  );
                  break;
                case "double precision":
                case "decimal":
                  result = (
                    <FilterDecimal
                      setValue={setValue}
                      submit={submit}
                      key={key}
                      value={value}
                      field={e.key}
                      label={e.name}
                    />
                  );
                  break;
                case "timestamp without time zone":
                case "timestamp with time zone":
                  result = (
                    <FilterDate
                      setValue={setValue}
                      submit={submit}
                      key={key}
                      operator={"date"}
                      setOperator={(op) => {
                        _.set(e, "filter.type", "date");
                        _.set(e, "filter.operator", op);
                      }}
                      onlyBetween={_.get(e, "filter.onlyBetween")}
                      value={value}
                      label={e.name}
                    />
                  );
                  break;
                case "boolean":
                  result = (
                    <FilterBoolean
                      setValue={setValue}
                      submit={submit}
                      key={key}
                      value={value}
                      label={e.name}
                      field={e.key}
                    />
                  );
                  break;
                case "date":
                  result = (
                    <FilterDate
                      setValue={setValue}
                      submit={submit}
                      key={key}
                      operator={_.get(e, "filter.operator")}
                      setOperator={(op) => {
                        _.set(e, "filter.type", "date");
                        _.set(e, "filter.operator", op);
                      }}
                      onlyBetween={_.get(e, "filter.onlyBetween")}
                      value={value}
                      label={e.name}
                    />
                  );
                  break;
                case "select":
                  result = (
                    <FilterSelect
                      setValue={setValue}
                      submit={submit}
                      key={key}
                      value={value}
                      field={e.key}
                      items={e.filter.items}
                      label={e.name}
                    />
                  );
                  break;
              }
            }
            if (result)
              return (
                <div className="filter-item-box" key={e.key}>
                  {result}
                  <div className="separator"></div>
                </div>
              );

            return null;
          }
        })}

        {meta.show && (
          <Callout
            onDismiss={() => (meta.show = false)}
            setInitialFocus={true}
            target={btnRef.current}
          >
            <div
              style={{
                padding: 10,
                display: "flex",
                width: "250px",
                flexWrap: "wrap",
                flexDirection: "row",
              }}
            >
              {meta.columns.map((e, key) => {
                return (
                  <Checkbox
                    key={e.key}
                    styles={{
                      root: { marginBottom: 3, marginRight: 3, width: "120px" },
                    }}
                    label={e.name}
                    checked={!!meta.visibles[e.key]}
                    onChange={() => {
                      if (meta.visibles[e.key]) {
                        meta.visibles[e.key] = false;
                      } else {
                        meta.visibles[e.key] = true;
                      }
                    }}
                  />
                );
              })}
            </div>
          </Callout>
        )}
      </div>
    </div>
  );
});
