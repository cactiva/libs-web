import { columnDefs } from "..";
import api from "@src/libs/utils/api";

export default async (props: {
    structure: any,
    idKey: string,
}) => {
    const { structure, idKey } = props;

    if (structure.fkeys === undefined) {
        const res = await api({ url: `/api/db/structure?table=${structure.name}` }) as any[];
        if (res) {
            const tempfkeys = {};
            res.forEach(e => {
                if (e.table_name === structure.name) {
                    tempfkeys[e.column_name] = e;
                } else {
                    if (!tempfkeys[e.table_name]) {
                        tempfkeys[e.table_name] = {};
                    }
                    tempfkeys[e.table_name][e.column_name] = e;
                }
            })
            structure.fkeys = tempfkeys;
        }
    }

    if (structure.fkeys && structure.fkeys[idKey]) {
        if (structure) {
            let hasId = false;
            structure.fields.forEach(e => {
                if (e.name === idKey) {
                    hasId = true;
                }
            })
            if (!hasId) {
                structure.fields.push({ name: idKey });
            }
        }
    }
    if (!columnDefs[structure.name]) {
        const res = await api({ url: `/api/db/columns?table=${structure.name}` }) as any[];
        if (res) {
            columnDefs[structure.name] = {
                columns: res,
                data: []
            };
        }
    }
}