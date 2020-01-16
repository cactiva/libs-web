import React from 'react';
import { observer } from 'mobx-react-lite';
import Text from '../Text';
import _ from 'lodash';

const NiceValue = observer(({ value, style }: any) => {
    let valueEl: any = null;
    if (typeof value === 'object') {
        if (value === null) {
            valueEl = null;
        } else {
            let keys = Object.keys(value);

            if (keys.indexOf('id') >= 0) {
                keys.splice(keys.indexOf('id'), 1)
            }

            valueEl = keys.length === 1
                ? <Text>{
                    typeof value[keys[0]] === "object"
                        ? <NiceValue value={value[keys[0]]} />
                        : value[keys[0]]
                }</Text>
                : <table cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse', ...style }}>
                    <tbody>
                        {keys.map((key: string) => {
                            return <tr key={key} style={{ verticalAlign: 'top' }}>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: 6, paddingTop: 2, paddingBottom: 2
                                }}>
                                    <Text style={{ fontSize: 13 }}>
                                        {_.startCase(key)}
                                    </Text>
                                </td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: 6, paddingTop: 2, paddingBottom: 2
                                }}>
                                    {typeof value[key] === 'object' ? <NiceValue
                                        style={{ marginLeft: -4, marginRight: -4 }}
                                        value={value[key]} /> : <Text style={{ fontSize: 13 }}>{value[key]}</Text>}
                                </td>
                            </tr>
                        })}
                    </tbody>
                </table>
        }
    } else {
        valueEl = <Text>{value}</Text>
    }
    return valueEl;
});

export default NiceValue;