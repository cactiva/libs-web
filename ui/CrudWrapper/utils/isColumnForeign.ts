export const isColumnForeign = (col: string, fkeys) => {
    const fcol = fkeys ? Object.keys(fkeys) : [];
    const res = fcol.filter(f => {
        if (col.replace(f, '').length <= 2) {
            return true;
        }
        return false;
    })

    if (res.length > 0) {
        const fcol = Object.keys(fkeys[res[0]]);
        if (fcol.length > 0) {
            const fk = fkeys[res[0]][fcol[0]];
            if (typeof fk === 'object') {
                return { ...fk, foreign_column: fcol[0] };
            }
        }
    }
    return false;
}