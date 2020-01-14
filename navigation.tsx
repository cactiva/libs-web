import React, { useEffect, useState } from "react";
import { router } from "react-navigation-hooks";

const pages = {
    components: {} as any,
    routes: {} as any,
    initial: ''
}
const Container = () => {
    const [ready, setReady] = useState(false);
    const routeResult = router.useRoutes(pages.routes);
    let App = () => {
        if (!ready) {
            return <div></div>
        }
        return routeResult || <div>Not Found</div>;
    };
    useEffect(() => {
        import("@src/components").then(res => {
            pages.components = res.default;
            pages.initial = res.initialRouteName;
            pages.routes = {};

            for (let i in pages.components) {
                const Component: any = pages.components[i];
                pages.routes["/" + i] = (navigation: any) => <Component navigation={navigation} />;
            }

            const Component = pages.components[pages.initial];
            pages.routes["/"] = (navigation: any) => <Component navigation={navigation} />;
            setReady(true);
        })
    })
    return (
        <div className="web-root">
            <App />
        </div>
    );
}


export const AppContainer = () => {
    return () => <Container />;
};
