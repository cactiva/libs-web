import * as React from 'react';
import { DatePicker } from 'office-ui-fabric-react';
import { dateFormat } from '@src/libs/utils/date';
import { useObservable, observer } from 'mobx-react-lite';
import { parseISO } from 'date-fns';

export default observer((props: any) => {
    const meta = useObservable({ date: null as any });

    React.useEffect(() => {
        if (props.value) {
            if (typeof props.value === 'string') {
                meta.date = parseISO(props.value);
            } else {
                meta.date = props.value;
            }
        }
    }, []);

    return <DatePicker
        {...props}
        value={meta.date}
        formatDate={(date?: Date): string => {
            if (!date) return "";
            return dateFormat(date, 'dd MMM yyyy');
        }}
        onSelectDate={(e: any) => {
            meta.date = e;
            if (props.setValue)
                props.setValue(e);
        }} />
});