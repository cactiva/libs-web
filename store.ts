import { observable, observe } from "mobx";

const storage = localStorage;

export default <T>(name: string, data: T): T => {
    const initData = data;
    const vname = `store.${name}`;
    const sData = storage.getItem(vname);
    let obs = observable(initData);
    if (sData) {
        let newData = JSON.parse(sData);
        for (let i in newData) {
            obs[i] = newData[i];
        }
    }

    observe(obs, () => {
        storage.setItem(vname, JSON.stringify(obs));
    });

    return obs;
};
