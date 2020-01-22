import * as React from 'react';
import { DatePicker, MaskedTextField } from 'office-ui-fabric-react';
import { setHours, setMinutes, getHours, getMinutes, parseISO } from 'date-fns';
import { useObservable, observer } from 'mobx-react-lite';
import { dateFormat } from '@src/libs/utils/date';
import _ from "lodash";

export default observer((props: any) => {
    const meta = useObservable({
        date: null,
        time: "",
    }) as any;

    React.useEffect(() => {
        if (props.value) {
            if (typeof props.value === 'string') {
                meta.date = parseISO(props.value);
                props.onChange(meta.date);
            } else {
                meta.date = props.value;
            }
            const h = getHours(meta.date);
            const m = getMinutes(meta.date);

            if (h !== undefined && m !== undefined) meta.time = `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
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
        const oldDate = date;

        const ts = meta.time.split(':');
        if (ts.length === 2) {
            date = setHours(date, parseInt(ts[0]));
            date = setMinutes(date, parseInt(ts[1]));
        }
        if (date.getTime() !== date.getTime()) date = oldDate
        return date;
    }

    const rootStyle = _.get(props, 'styles.root');

    return <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', ...rootStyle }}>
        <DatePicker
            {...props}
            isRequired={props.required}
            textField={{
                errorMessage: props.errorMessage
            }}
            styles={{ root: { minWidth: '130px', flex: 1 } }}
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
            styles={{ root: { paddingLeft: 10, width: '65px' }, field: { textAlign: 'center' } }}
            value={meta.time}
            label={props.label ? '‎' : undefined}
            errorMessage={props.errorMessage ? '‎' : undefined}
            onBlur={() => {
                if (props.onChange) {
                    props.onChange(getValue());
                }
            }}
            onChange={(e: any) => {
                meta.time = e.target.value;
            }}
        />
    </div>
})