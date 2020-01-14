import { toJS } from "mobx";
import { generateInsertString } from "@src/libs/utils/genInsertString";
import { queryAll } from "@src/libs/utils/gql";
import { generateUpdateString } from "@src/libs/utils/genUpdateString";

export default async ({ mode, reload, form, structure, setLoading, setMode, auth, idKey }: any) => {
    let q: any = null;

    switch (mode) {
        case 'create':
            q = generateInsertString(structure, toJS(form));
            setLoading(true);
            const res = await queryAll(q.query, { variables: q.variables, auth });
            await reload()
            setMode('');
            setLoading(false)
            form[idKey] = res[idKey];

            break;
        case 'edit':
            q = generateUpdateString(structure, toJS(form), {
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