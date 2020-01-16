import { toJS } from "mobx";
import { generateInsertString } from "@src/libs/utils/genInsertString";
import { queryAll } from "@src/libs/utils/gql";
import { generateUpdateString } from "@src/libs/utils/genUpdateString";

export default async ({ mode, reload, form, structure, setLoading, setMode, auth, idKey, hasRelation }: any) => {
    let q: any = null;

    const fdata = toJS(form);

    if (structure.overrideForm) {
        for (let i in structure.overrideForm) {
            fdata[i] = structure.overrideForm[i];
        }
    }

    switch (mode) {
        case 'create':
            q = generateInsertString(structure, fdata);
            setLoading(true);
            const res = await queryAll(q.query, { variables: q.variables, auth });
            if (!hasRelation) {
                await reload()
                setMode('');
            } else {
                setMode('edit');
            }
            form[idKey] = res[idKey];
            setLoading(false)
            break;
        case 'edit':
            q = generateUpdateString(structure, fdata, {
                where: [
                    {
                        name: idKey,
                        operator: '_eq',
                        value: form[idKey],
                        valueType: 'Int'
                    }
                ]
            });

            setLoading(true);
            await queryAll(q.query, { variables: q.variables, auth });
            await reload;
            setMode('');
            setLoading(false);
            break;
        default:
            setMode('');
            break;
    }
}