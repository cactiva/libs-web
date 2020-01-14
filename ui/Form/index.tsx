import * as React from 'react';
import { observer, useObservable } from 'mobx-react-lite';
import _ from 'lodash';
import Field from '../Field';
import { uuid } from '@src/libs/utils';

export default observer((props: any) => {
    const { children, data, setValue, onSubmit } = props;
    const meta = useObservable({
        initError: false,
        validate: {}
    });

    return <div style={props.style}>
        {children && Array.isArray(children) ? (
            children.map((el: any) => {
                return (
                    <RenderChild
                        data={data}
                        setValue={setValue}
                        child={el}
                        key={uuid()}
                        meta={meta}
                        onSubmit={onSubmit}
                    />
                );
            })
        ) : (
                <RenderChild
                    data={data}
                    setValue={setValue}
                    child={children}
                    key={uuid()}
                    meta={meta}
                    onSubmit={onSubmit}
                />
            )}

    </div>;
});

const RenderChild = observer((props: any) => {
    const { data, child, setValue, meta, onSubmit } = props;
    if (!child || !child.type || !child.props) {
        return child;
    }
    const onPress = (e: any) => {
        meta.initError = true;
        let valid = true;
        Object.keys(meta.validate).forEach(e => {
            if (!meta.validate[e]) valid = false;
        });
        if (meta.initError && valid && onSubmit) {
            onSubmit(data);
        }
    };

    const defaultSetValue = (value: any, path: any) => {
        if (!!setValue) setValue(value, path);
        else {
            if (data) {
                _.set(data, path, value);
            } else {
                console.error("Failed to set value: Form data props is undefined");
            }
        }
        if (meta.initError) meta.initError = false;
    };


    if (typeof child.props.children === "function") {
        const fc = child.props.children(_.get(data, child.props.path, []));

        return React.cloneElement(child, {
            ...child.props,
            children: fc
        });
    } else if (child.type === Field) {
        let custProps: any;
        const isValid = (value: any) => {
            meta.validate[child.props.path] = value;
        };
        if (child.props && child.props.type === "submit") {
            custProps = {
                ...custProps,
                onPress: onPress
            };
        } else {
            custProps = {
                ...custProps,
                isValid: isValid,
                value: _.get(data, child.props.path),
                setValue: (value: any) => defaultSetValue(value, child.props.path)
            };
        }
        if (child.props.isRequired) {
            custProps = {
                ...custProps,
                isValidate: meta.initError
            };
        }
        return React.cloneElement(child, {
            ...custProps,
            ...child.props
        });
    } else {
        const childrenRaw = _.get(child, "props.children");
        const hasChildren = !!childrenRaw;
        if (!hasChildren) {
            return child;
        } else if (child.props) {
            const children = Array.isArray(childrenRaw) ? childrenRaw : [childrenRaw];
            const props = { ...child.props };
            if (child.props && child.props.type === "submit") {
                props.onPress = onPress;
            }
            return React.cloneElement(child, {
                ...props,
                children: children.map((el, idx) => (
                    <RenderChild
                        key={idx}
                        data={data}
                        setValue={setValue}
                        child={el}
                        meta={meta}
                        onSubmit={onSubmit}
                    />
                ))
            });
        }
    }
});

