import { toJS } from "mobx";
import { generateInsertString } from "@src/libs/utils/genInsertString";
import { queryAll } from "@src/libs/utils/gql";
import { generateUpdateString } from "@src/libs/utils/genUpdateString";
import session from "@src/stores/session";
import _ from "lodash";
import { alert } from "@src/Main";

export default async ({
  mode,
  reload,
  setForm,
  afterSubmit,
  form,
  structure,
  meta,
  setLoading,
  setMode,
  auth,
  idKey,
  hasRelation,
}: any) => {
  let q: any = null;

  const fdata = toJS(form);
  if (structure.overrideForm) {
    for (let i in structure.overrideForm) {
      fdata[i] = structure.overrideForm[i];
    }
  }

  const id_user = session.user.id;
  const current_date = new Date();
  const struct = _.map(structure.fields, "name");

  switch (mode) {
    case "create":
      if (struct.includes("created_by")) fdata.created_by = id_user;
      if (struct.includes("created_date")) fdata.created_date = current_date;
      q = generateInsertString(structure, fdata);
      setLoading(true);
      let isError = false;
      const res = await queryAll(q.query, {
        variables: q.variables,
        auth,
        onError: (r) => {
          isError = true;
          alert(r.errors.map((err) => err.message).join("\n"));
        },
      });

      if (!isError) {
        form[idKey] = res[idKey];
        if (afterSubmit !== undefined) {
          if (hasRelation) {
            setMode("edit");
          }
          if ((await afterSubmit(form, res[idKey])) !== true) {
            setLoading(false);
            return;
          }
        }

        if (!hasRelation) {
          await reload();
          setMode("");
        } else {
          setMode("edit");
          meta.shouldRefresh = true;
          setForm(toJS(form));
        }
      }
      setLoading(false);

      break;
    case "edit":
      if (struct.includes("updated_by")) fdata.updated_by = id_user;
      if (struct.includes("updated_date")) fdata.updated_date = current_date;
      q = generateUpdateString(structure, fdata, {
        where: [
          {
            name: idKey || "id",
            operator: "_eq",
            value: fdata[idKey || "id"],
            valueType: "Int",
          },
        ],
      });
      setLoading(true);
      await queryAll(q.query, { variables: q.variables, auth });
      if (afterSubmit !== undefined) {
        if ((await afterSubmit(form, form[idKey])) !== true) {
          setLoading(false);
          return;
        }
      }
      // afterSubmit
      // setMode("");
      alert('Form Saved!');
      setLoading(false);
      reload();
      break;
    default:
      setMode("");
      break;
  }
};
