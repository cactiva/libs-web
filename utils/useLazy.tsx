import { useState } from "react";

const masterModule = {
    registered: {}
};

export const registerLazy = (m) => {
    masterModule.registered = m;
}

export const useLazy = (module: string): any => {
    const modules = masterModule.registered;
    const [loading, setLoading] = useState(true);
    if (modules[module] instanceof Promise) {
        modules[module].then((e) => {
            modules[module] = e;
            setLoading(false);
        });
    }

    return new Proxy(
        {},
        {
            get(target, name) {
                const m = modules[module];

                if (name === '_loading') {
                    if (m instanceof Promise) {
                        return loading;
                    }
                    return true;
                }

                if (m instanceof Promise) {
                    return null;
                }

                return m[name];
            },
        }
    );
};
