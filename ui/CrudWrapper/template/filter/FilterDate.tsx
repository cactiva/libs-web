import * as React from 'react';
import ItemButton from './ItemButton';
import { observer } from 'mobx-react-lite';
import { DatePicker, Dropdown, Label } from 'office-ui-fabric-react';
import { dateFormat } from '@src/libs/utils/date';
import Monthly from './Date/Monthly';
import _ from 'lodash';
import { DateTime } from '@src/libs/ui';
import { startCase } from '@src/libs/utils';
interface IFilterDate {
    label
    field?
    value
    setValue
    operator
    setOperator
    onlyBetween
    submit
}
export default observer((props: IFilterDate) => {
    const { label, field, value, setValue, operator, setOperator, onlyBetween, submit } = props;
    let op = operator || 'date';
    const ops = onlyBetween ? ['monthly'] : ['date', 'datetime', 'monthly'];
    const opsItems = ops.map(r => {
        return {
            key: r,
            text: startCase(r)
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
                return <div>
                    <Label style={{
                        fontWeight: 'normal',
                        fontSize: 14,
                        marginTop: -5
                    }}>{`${label}:`}</Label>
                </div>;
            }}
            selectedKey={op}
            options={opsItems}
            onChange={(e, item: any) => {
                setOperator(item.key);
                if (item.key === 'date' || item.key === 'datetime') {
                    setValue(undefined);
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
            datetime: (
                value instanceof Date ? dateFormat(value) : (typeof value === 'object' && value.from) ? dateFormat(value.from, "dd MMM yyyy") : undefined
            ),
            date: (
                value instanceof Date ? dateFormat(value, "dd MMM yyyy") : (typeof value === 'object' && value.from) ? dateFormat(value.from, "dd MMM yyyy") : undefined
            )
        } as any)[op]}>
        {({
            monthly: null,
            datetime: (
                <DateTime
                    value={value instanceof Date ? value : (typeof value === 'object' && value.from) ? value.from : undefined}
                    onChange={(e: any) => {
                        setValue(e);
                        submit();
                    }}
                    styles={{ root: { padding: 10 } }} />),
            date: (
                <DatePicker
                    value={value instanceof Date ? value : (typeof value === 'object' && value.from) ? value.from : undefined}
                    formatDate={(date?: Date): string => {
                        if (!date) return "";
                        return dateFormat(date, 'dd MMM yyyy');
                    }}
                    onSelectDate={(e: any) => {
                        setValue(e);
                        submit();
                    }}
                    styles={{ root: { padding: 10 } }} />
            )
        } as any)[op]}
    </ItemButton>;
})