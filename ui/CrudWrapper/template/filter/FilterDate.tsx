import * as React from 'react';
import ItemButton from './ItemButton';
import { observer } from 'mobx-react-lite';
import { DatePicker, Dropdown, Label } from 'office-ui-fabric-react';
import { dateFormat } from '@src/libs/utils/date';
import Monthly from './Date/Monthly';
import _ from 'lodash';

export default observer(({ label, field, value, setValue, operator, setOperator, onlyBetween, submit }: any) => {
    let op = operator || 'date';
    const ops = onlyBetween ? ['monthly'] : ['date', 'monthly'];
    const opsItems = ops.map(r => {
        return {
            key: r,
            text: _.startCase(r)
        }
    })

    return <ItemButton
        label={<Dropdown
            styles={{
                title: {
                    border: '0',
                    paddingRight: 0,
                },
                callout: {
                    minWidth: '90px',
                },
                dropdownOptionText: {
                    fontSize: 13,
                },
                caretDownWrapper: {
                    display: 'none'
                }
            }}
            onRenderTitle={() => {
                return <div style={{}}>
                    <Label style={{ fontWeight: 'normal', fontSize: 14, marginTop: -5 }}>{`${label}:`}</Label>
                </div>;
            }}
            selectedKey={op}
            options={opsItems} onChange={(e, item: any) => {
                setOperator(item.key);
                if (item.key === 'date') {
                    if (value && value.from) {
                        setValue(value.from);
                    }
                    submit();
                }
            }} />}
        field={field}
        setValue={setValue}
        onClose={() => submit()}
        callout={false}
        value={({
            monthly: (
                <Monthly value={value} setValue={setValue} submit={submit} />
            ),
            date: (
                value instanceof Date ? dateFormat(value, "dd MMM yyyy") : (typeof value === 'object' && value.from) ? dateFormat(value.from, "dd MMM yyyy") : undefined
            )
        } as any)[op]}>
        {({
            monthly: null,
            date: (
                <DatePicker
                    value={value instanceof Date ? value : (typeof value === 'object' && value.from) ? value.from : undefined}
                    formatDate={(date?: Date): string => {
                        if (!date) return "";
                        return dateFormat(date, 'dd MMM yyyy');
                    }}
                    onSelectDate={(e: any) => {
                        setValue(e);
                    }}
                    styles={{ root: { padding: 10 } }} />
            )
        } as any)[op]}
    </ItemButton>;
})