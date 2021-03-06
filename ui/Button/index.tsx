import _ from 'lodash';
import { DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import * as React from 'react';
import Text from '../Text';


interface IButtonProps {
    type?: string,
    children?: any,
    style?: any,
    onPress?: any,
    onClick?: any,
    iconProps?: any,
    className?: any,
    options?: {
        key?: string,
        mode?: string,
        icon?: string,
        filename?: string,
        onClick?: (event: any, options: { reloadList: () => void }) => void
    }
}

export default (props: IButtonProps) => {
    let children = props.children;
    let text = undefined;
    let styles: any = undefined;

    if (Array.isArray(children) && _.get(children, '0.props.child.type') === Text) {
        let lstyle = _.get(children, '0.props.child.props.style');
        text = _.get(children, '0.props.child.props.children');
        children = undefined;

        if (lstyle) {
            styles = {
                label: lstyle
            };
        }
    } else if (children.type === Text) {
        let lstyle = _.get(children, 'props.style');
        text = _.get(children, 'props.children');
        children = undefined;

        if (lstyle) {
            styles = {
                label: lstyle
            };
        }
    }

    let onClick = props.onClick ? props.onClick : () => { };
    if (props.onPress)
        onClick = props.onPress;

    if (props.type === 'submit') {
        return <PrimaryButton {...props} styles={styles} onClick={onClick} text={text} children={children} />;
    }

    return <DefaultButton {...props} styles={styles} onClick={onClick} text={text} children={children} />;
}
