import { Text, TouchableOpacity, View } from '@src/libs';
import { observer } from 'mobx-react-lite';
import { Icon } from 'office-ui-fabric-react';
import React from 'react';
import { filterStyles } from './index';
export default observer((props: any) => {
    const currentValue = props.currentValue;
    return <View style={filterStyles.outerContainer}>
        <View style={filterStyles.container}>
            <View style={filterStyles.labelContainer}>
                <Text style={filterStyles.label}>{props.title}</Text>
            </View>
            <View style={filterStyles.field}>
                {currentValue !== undefined &&
                    <TouchableOpacity onPress={() => {
                        props.form[props.name]--;
                        props.submit();
                    }}><Icon iconName="ChevronLeft" /></TouchableOpacity>
                }
                <TouchableOpacity style={filterStyles.inputTextContainer} onPress={() => {
                    const value = prompt('Please type a number', props.currentValue);
                    if (typeof value === 'string' && props.currentValue !== value) {
                        if (value === '') {
                            delete props.form[props.name];
                        } else {
                            props.form[props.name] = parseInt(value);
                        }
                        props.submit();
                    }
                }}>
                    {currentValue !== undefined ? <Text style={filterStyles.inputText}> {currentValue}</Text> : 'All'}
                </TouchableOpacity>
                {currentValue !== undefined &&
                    <TouchableOpacity onPress={() => {
                        props.form[props.name]++;
                        props.submit();
                    }}><Icon iconName="ChevronRight" /></TouchableOpacity>
                }
            </View>
        </View>
    </View>
});
