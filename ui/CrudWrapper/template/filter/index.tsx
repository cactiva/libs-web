import Theme from "@src/theme.json";
import _ from 'lodash';
import { observer } from 'mobx-react-lite';
import React from 'react';
import Number from './Number';
import { View } from "@src/libs/ui";
export default observer((props: any) => {
    const form = _.get(props, 'filter.form', {});
    const optionCols = _.cloneDeep(_.get(props, 'options.columns', {}));
    const optionColsKeys = Object.keys(optionCols);
    const columns: any = [];

    if (optionColsKeys.length === 0) {
        props.columns.map(e => {
            columns.push(e);
        });

    } else {
        optionColsKeys.map(key => {
            columns.push({
                path: key,
                title: optionCols[key].label || _.startCase(key)
            })
        })
    }
    return <View style={filterStyles.outer}>{
        columns.map((e, idx) => {
            const columns = _.get(props, `defs.columns`, []);
            let type = _.get(props.options, `columns.${e.path}.type`, undefined);
            if (!type) {
                type = (_.find(columns, { column_name: e.path }) || {}).data_type;
            }
            switch (type) {
                case "number":
                case "numeric":
                case "integer":
                    return <Number
                        key={idx}
                        title={e.title}
                        submit={props.submit}
                        currentValue={form[e.path]}
                        form={form}
                        name={e.path} />;
                default:
                    // console.log(type);
                    break;
            }
        })
    }</View>;
})

export const filterStyles = {
    outer: { flexDirection: 'row', alignItems: 'center', padding: 10 },
    label: {
        fontSize: 14,
        fontFamily: _.get(Theme, "fontFamily", undefined),
        paddingHorizontal: 5
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    outerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'stretch',
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#ececeb',
        height: 30,
        marginRight: 5
    },
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 3,
        paddingHorizontal: 6,
        borderLeftWidth: 1,
        borderColor: '#ccc',
    },
    inputTextContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5 },
    inputText: {
        fontFamily: _.get(Theme, "fontFamily", undefined),
        fontSize: 14,
        minWidth: 30,
        marginLeft: -3,
        textAlign: 'center'
    },
    resetButton: {
        height: 20,
        backgroundColor: '#ececeb',
        borderColor: '#ccc',
        borderWidth: 1,
        borderLeftWidth: 0,
        marginLeft: -5,
        marginRight: 5,
        padding: 2,
        flexDirection: 'row',
        alignItems: 'center'
    }
}