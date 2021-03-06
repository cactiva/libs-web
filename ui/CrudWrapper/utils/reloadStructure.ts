import { columnDefs } from "..";
import api from "@src/libs/utils/api";
import { toJS } from "mobx";
import _ from "lodash";

const structures = {} as any;
export const loadColDefs = async (name, reset?) => {
  const cols = localStorage[`structure-cd-${name}`];
  if (!reset && cols) {
    try {
      const prs = JSON.parse(cols);
      if (prs) {
        columnDefs[name] = prs;
      }
    } catch (e) {
      console.log(e);
    }
  }

  if (columnDefs[name] === undefined) {
    columnDefs[name] = api({ url: `/api/db/columns?table=${name}` });
  }
  if (columnDefs[name] instanceof Promise) {
    columnDefs[name] = await columnDefs[name];
    localStorage[`structure-cd-${name}`] = JSON.stringify(columnDefs[name]);
  }

  return columnDefs[name];
};
export const loadStructure = async (
  name,
  indexed = false,
  setLoading?,
  reset?
) => {
  if (!reset && localStorage[`structure-${name}`]) {
    try {
      const prs = JSON.parse(localStorage[`structure-${name}`]);
      if (prs) {
        structures[name] = prs;
      }
    } catch (e) {
      console.log(e);
    }
  }

  if (structures[name] === undefined) {
    if (setLoading) {
      setLoading(`Relation: ${_.upperCase(name)}`);
    }
    structures[name] = api({ url: `/api/db/structure?table=${name}` });
  }
  if (structures[name] instanceof Promise) {
    structures[name] = await structures[name];
    localStorage[`structure-${name}`] = JSON.stringify(structures[name]);
  }

  if (indexed) {
    return _.chain(_.cloneDeep(structures[name]))
      .keyBy("foreign_table_name")
      .value();
  }

  return structures[name];
};

export default async (props: {
  structure: any;
  idKey: string;
  setLoading?: (value) => any;
  reset?: boolean;
}) => {
  const { structure, idKey, reset } = props;

  if (structure.fkeys === undefined) {
    const res = await loadStructure(
      structure.name,
      false,
      props.setLoading,
      reset
    );

    if (res) {
      const tempfkeys = {};
      res.forEach((e) => {
        if (e.table_name === structure.name || e.alias === structure.name) {
          tempfkeys[e.column_name] = e;
        } else {
          if (!tempfkeys[e.table_name]) {
            tempfkeys[e.table_name] = {};
          }
          tempfkeys[e.table_name][e.column_name] = e;
        }
      });
      structure.fkeys = tempfkeys;
    }
  }

  if (structure.fkeys && structure.fkeys[idKey]) {
    if (structure) {
      let hasId = false;
      structure.fields.forEach((e) => {
        if (e.name === idKey) {
          hasId = true;
        }
      });
      if (!hasId) {
        structure.fields.push({ name: idKey });
      }
    }
  }

  if (props.setLoading) {
    props.setLoading(`Structure: ${_.upperCase(structure.name)}`);
  }
  await loadColDefs(structure.name, reset);

  if (structure.fields && structure.fkeys) {
    const sf = await loadSubFields(
      structure.fields,
      structure.fkeys,
      props.setLoading,
      reset
    );
    sf.forEach((e) => {
      columnDefs[structure.name].push(e);
    });
  }

  return structure.fkeys;
};

const loadSubFields = async (fields, fkeys, setLoading?, reset?) => {
  const keys = _.chain(_.cloneDeep(fields)).keyBy("name").value();
  const res = [] as any;
  await Promise.all(
    fields.map(async (field) => {
      const fk = fkeys[field.name];

      if (fk) {
        const tname = fk.foreign_table_name;
        const col = keys[tname] || keys[tname + "s"];
        if (col) {
          const sfkeys = await loadStructure(tname, true, setLoading, reset);
          fk.columns = await loadStructure(tname, false, undefined, reset);

          if (setLoading) {
            setLoading(`Structure: ${_.upperCase(tname)}`);
          }
          await loadColDefs(tname, reset);

          const columns = {};
          toJS(columnDefs[tname]).forEach((e) => {
            columns[e.column_name] = e;
          });
          const result = {
            column_name: col.name,
            data_type: "relations",
            columns,
            fk,
          };
          if (col.fields) {
            await Promise.all(
              col.fields.map(async (subfield) => {
                if (subfield.fields) {
                  if (sfkeys[subfield.name]) {
                    const subfkeys = await loadStructure(
                      sfkeys[subfield.name].foreign_table_name,
                      true,
                      setLoading,
                      reset
                    );
                    result.columns[subfield.name] = (
                      await loadSubFields([subfield], subfkeys)
                    )[0];
                  }
                }
              })
            );
          }
          res.push(toJS(result));
        }
      }
    })
  );
  return res;
};
