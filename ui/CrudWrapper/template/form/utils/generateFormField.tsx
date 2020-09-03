import { startCase } from "@src/libs/utils";
import pluralize from "@src/libs/utils/pluralize";
import gql from "graphql-tag";
import _ from "lodash";
import * as React from "react";
import { DateTime, Field, Input, Select } from "../../../..";
import DateField from "../../../../DateField";
import FileUpload from "../../fields/FileUpload";
import SelectFk from "../../fields/SelectFk";
import generateSubStructure from "./generateSubStructure";
import { toJS } from "mobx";

export const generateFieldWidth = (px) => {
  return px < 800 ? (px < 550 ? "98%" : "48%") : "32%";
};

export const generateFormField = (
  parsedForm: any,
  structure,
  colDef,
  fkeys,
  auth,
  errors,
  meta,
  data,
  generateForm,
  modifyColumns,
  width
) => {
  const relations = {};
  const hidden: any = [];

  const keys = {};
  let columns = _.cloneDeep(_.get(parsedForm, "props.children", []));
  if (!Array.isArray(columns)) {
    columns = [columns];
  }

  const subs = columns.filter((e) => {
    return _.get(e, "props.sub");
  });
  columns = columns.filter((e) => {
    return !_.get(e, "props.sub");
  });
  columns.forEach((e) => {
    const path = _.get(e, "props.path");
    if (path) keys[path] = e;
  });
  const ovrd = structure.overrideForm || {};
  _.map(colDef, (e, k) => {
    if (e.is_nullable === "NO" && !e.column_default && k !== "id" && !ovrd[k]) {
      const col = _.find(columns, { props: { path: k } });
      if (!col && generateForm === "auto") {
        let label = startCase(k);
        if (label.indexOf("Id") === 0 || label.indexOf("id") === 0)
          label = label.substr(3);
        columns.push(
          <Field path={k} label={label}>
            <Input />
          </Field>
        );
      }
    }
  });

  const indexed = {};
  columns = columns
    .filter((e) => {
      let fk: any = null;
      if (!e || !_.get(e, "props.path")) {
        return e;
      }
      if (indexed[e.props.path]) return false;
      indexed[e.props.path] = true;
      if (e.props.path.indexOf(".") > 0) {
        const eks = e.props.path.split(".");
        let found: any = null;
        let i: any = 0;
        for (i in eks) {
          const tname = eks[i];
          if (i * 1 === 0) {
            found = _.find(fkeys, { foreign_table_name: tname });
            if (!found) {
              found = _.find(fkeys, {
                foreign_table_name: pluralize.singular(tname),
              });
            }
          } else {
            let tfound = _.find(found, { table_name: tname });
            if (!tfound) {
              tfound = _.find(found, { table_name: pluralize.singular(tname) });
            }
            if (tfound) found = tfound;
          }

          if (found && found.columns) {
            found = found.columns;
          }
        }
        if (found) {
          fk = found;
        }
      } else {
        fk = fkeys[e.props.path];
        if (!fk) fk = fkeys[pluralize.singular(e.props.path)];
        if (!fk) {
          _.forEach(fkeys, (f) => {
            if (!f.table_schema) {
              _.forEach(f, (fe) => {
                if (fe.constraint_name === e.props.path) {
                  fk = f;
                }
              });
            }
          });
        }
      }

      if (fk) {
        if (e.props.path.indexOf(".") > 0) {
          relations[e.props.path] = {
            path: e.props.path,
            column: e,
            fkey: fk,
            options: e.props.options,
            children: e.props.children,
          };
          relations[e.props.path].sub = generateSubStructure(
            relations[e.props.path],
            structure,
            data,
            width
          );
          return false;
        } else if (!fk.table_schema) {
          relations[e.props.path] = {
            path: e.props.path,
            column: e,
            fkey: fk,
            options: e.props.options,
            children: e.props.children,
          };
          relations[e.props.path].sub = generateSubStructure(
            relations[e.props.path],
            structure,
            data,
            width
          );

          return false;
        } else {
          if (fk && fk.table_name === structure.name) {
            const tablename = fk.foreign_table_name;
            const key: any = keys[tablename] || keys[tablename + "s"];
            if (key) {
              hidden.push(key.props.path);
            }
          }
        }
      }
      return true;
    })
    .filter((e) => !!e && !!e.props && hidden.indexOf(e.props.path) < 0);

  const modifiedCols = !!modifyColumns
    ? modifyColumns(columns.map((e) => e.props))
    : [];

  columns = columns
    .map((e, idx) => {
      if (!e || !_.get(e, "props.path")) {
        return e;
      }

      const eprops = !!modifyColumns ? modifiedCols[idx] : e.props;
      if (!eprops) return undefined;
      const path = eprops.path;
      const cdef = colDef[path];
      const fk = fkeys[path];
      let label = eprops.label;
      let children = eprops.children;
      if (label.indexOf("Id") === 0) {
        label = eprops.label.substr(3);
      }
      let type = _.get(e, "props.options.type");

      let childrenType = _.get(e, "props.children.props.type");
      if (childrenType === "file") type = childrenType;

      const rel = _.get(eprops, "options.relation", {});
      let useCustomRel = false;
      if (rel.to && rel.query) {
        const qstruct = gql`
          ${rel.query}
        `;
        const tablename = _.get(
          qstruct,
          "definitions.0.selectionSet.selections.0.name.value"
        );
        if (tablename) {
          children = (
            <SelectFk
              tablename={tablename}
              labelField={eprops.labelField}
              readonly={eprops.readonly}
              relationPage={_.get(eprops, "options.relationPage")}
              relation={rel}
              auth={auth}
              fieldWidth={width}
            />
          );
          useCustomRel = true;
        }
      }

      if (!useCustomRel) {
        if (cdef || fk || type) {
          if (fk) {
            const tablename = fk.foreign_table_name;
            if (tablename) {
              const readonly = type === "readonly";
              children = (
                <SelectFk
                  tablename={tablename}
                  labelField={eprops.labelField}
                  readonly={readonly}
                  relationPage={_.get(eprops, "options.relationPage")}
                  relation={_.get(eprops, "options.relation")}
                  auth={auth}
                  fieldWidth={width}
                />
              );
            }
          } else {
            if (!type && cdef.data_type) {
              type = cdef.data_type;
            }

            if (path.indexOf("file") === 0) {
              type = "file";
            }

            switch (type) {
              case "file":
                children = <FileUpload table={structure.name} field={path} />;
                break;
              case "integer":
                children = <Input type="number" />;
                break;
              case "double":
                children = <Input type="double" />;
                break;
              case "numeric": // money
                children = <Input type="money" />;
              case "decimal":
                children = <Input type="decimal" />;
                break;
              case "double precision":
                children = <Input type="decimal" />;
                break;
              case "money":
                children = <Input type="money" />;
                break;
              case "timestamp without time zone":
              case "timestamp with time zone":
                children = <DateTime />;
                break;
              case "date":
                children = <DateField />;
                break;
              case "readonly":
                children = <Input type="text" readOnly disabled={true} />;
                break;
              case "readonly-numeric":
                children = <Input type="money" readOnly disabled={true} />;
                break;
              case "readonly-datetime":
                children = (
                  <DateTime disableDate={"disabled"} disableTime={"disabled"} />
                );
                break;
              case "readonly-boolean":
                children = <Input type="boolean" readOnly disabled={true} />;
                break;
              case "textarea":
                children = <Input type="text" multiline={true} />;
                break;
              case "boolean":
                children = <Input type="boolean" />;
                break;
              default:
                children = <Input type="text" />;
            }
          }
        }
      }

      const required =
        _.get(cdef, "is_nullable", "YES") === "NO" &&
        !_.get(cdef, "column_default", null);
      return {
        children,
        props: {
          ...eprops,
          required,
          errorMessage: errors[eprops.path],
          label,
          style: eprops.style,
          styles: {
            root: {
              width: generateFieldWidth(width),
              marginRight: "10px",
            },
          },
        },
      };
    })
    .filter((e) => !!e);


  return { columns, relations, subs };
};
