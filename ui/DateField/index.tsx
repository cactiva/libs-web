import { dateFormat } from '@src/libs/utils/date';
import parseISO from 'date-fns/parseISO';
import { observer, useLocalStore } from 'mobx-react-lite';
import { DatePicker } from '@fluentui/react/lib/DatePicker';
import * as React from 'react';

export default observer((props: any) => {
    const meta = useLocalStore(() => ({ date: null as any }));

    React.useEffect(() => {
        if (props.value) {
            if (typeof props.value === 'string') {
                meta.date = parseISO(props.value);
                props.onChange(meta.date);
            } else {
                meta.date = props.value;
            }
        }
    }, []);

    const getValue = () => {
        let date = new Date();
        if (meta.date) {
            if (typeof meta.date === 'string') {
                date = parseISO(meta.date);
            } else {
                date = meta.date;
            }
        }
        return dateFormat(date, 'yyyy-MM-dd');
    }

    return <DatePicker
        {...props}
        isRequired={props.required}
        textField={{
            errorMessage: props.errorMessage
        }}
        value={meta.date}
        formatDate={(date?: Date): string => {
            if (!date) return "";
            return dateFormat(date, 'dd MMM yyyy');
        }}
        onSelectDate={(e: any) => {
            meta.date = e;
            props.onChange(getValue());
        }} />
});