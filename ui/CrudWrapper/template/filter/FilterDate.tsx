import * as React from 'react';
import ItemButton from './ItemButton';
import { observer } from 'mobx-react-lite';
import { DatePicker } from 'office-ui-fabric-react';
import { dateFormat } from '@src/libs/utils/date';

export default observer(({ label, field, value, setValue, submit }: any) => {
    return <ItemButton
        label={label}
        field={field}
        setValue={setValue}
        onClose={() => submit()}
        value={value instanceof Date ? dateFormat(value, "dd MMM yyyy") : ""}>
        <DatePicker
            value={value}
            formatDate={(date?: Date): string => {
                if (!date) return "";
                return dateFormat(date, 'dd MMM yyyy');
            }}
            onSelectDate={(e: any) => {
                setValue(e);
            }}
            styles={{ root: { padding: 10 } }} />
    </ItemButton>;
})