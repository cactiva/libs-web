import * as React from 'react';
import { DatePicker, MaskedTextField } from 'office-ui-fabric-react';
import { setHours, setMinutes, getHours, getMinutes } from 'date-fns';
import { useObservable, observer } from 'mobx-react-lite';
import { dateFormat } from '@src/libs/utils/date';

export default observer((props: any) => {
    const meta = useObservable({
        date: null,
        time: "",
    }) as any;


    React.useEffect(() => {
        if (props.value) {
            meta.date = props.value;
            const h = getHours(props.value);
            const m = getMinutes(props.value);
            if (h && m) meta.time = `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
        }
    }, []);

    const getValue = () => {
        let date = new Date();
        if (meta.date) date = meta.date;
        const oldDate = date;

        const ts = meta.time.split(':');
        if (ts.length === 2) {
            date = setHours(date, parseInt(ts[0]));
            date = setMinutes(date, parseInt(ts[1]));
        }
        if (date.getTime() !== date.getTime()) date = oldDate
        return date;
    }


    return <div style={{ display: 'flex', flexDirection: 'row' }}>
        <DatePicker
            styles={{ root: { padding: 10, width: '140px' } }}
            value={meta.date}
            formatDate={(date?: Date): string => {
                if (!date) return "";
                return dateFormat(date, 'dd MMM yyyy');
            }}
            onSelectDate={(value) => {
                meta.date = value;
                props.onChange(getValue());
            }}
        />
        <MaskedTextField mask="99:99"
            styles={{ root: { padding: 10, paddingLeft: 0, width: '65px' } }}
            value={meta.time}
            onChange={(e: any) => {
                meta.time = e.target.value;
                props.onChange(getValue());
            }}

        />


    </div>
})