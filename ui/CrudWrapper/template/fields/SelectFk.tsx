import { Select } from '@src/libs/ui';
import api from '@src/libs/utils/api';
import { queryAll } from '@src/libs/utils/gql';
import { observable, toJS } from 'mobx';
import { observer, useObservable } from 'mobx-react-lite';
import * as React from 'react';
import useAsyncEffect from 'use-async-effect';
import { columnDefs } from '../..';
import _ from 'lodash';
import { dateFormat } from '@src/libs/utils/date';
import { loadColDefs } from '../../utils/reloadStructure';

const queryCache = {};

export default observer((props: any) => {
    const { value, onChange } = props;

    const meta = useObservable({
        list: queryCache[getQuery(props)] || [],
        loading: false
    })
    useAsyncEffect(async () => {
        if (meta.list.length === 0) {
            meta.loading = true;
            meta.list = await loadList(props);
            meta.loading = false;

            if (queryCache[getQuery(props)].length === 0 && value) {
                delete queryCache[getQuery(props)];
                meta.loading = true;
                meta.list = await loadList(props);
                meta.loading = false;
            }
        }
    }, []);

    return <Select
        styles={props.styles}
        label={props.label}
        errorMessage={props.errorMessage}
        required={props.required}
        readonly={props.readonly}
        items={meta.loading ? [{ value: '', label: 'Loading...' }] : meta.list}
        selectedKey={meta.loading ? '' : value}
        onChange={(e, item) => {
            onChange(item && item.key);
        }} />
});

export const formatRelationLabel = (keys, e, colDef?) => {
    let usedKeys = keys;

    if (keys.length > 5) {
        usedKeys = keys.filter(f => {
            if (f.indexOf('name') >= 0) {
                return true;
            }
            return false;
        })
    } else {
        if (usedKeys.length === 0) {
            for (let i in keys) {
                if ((i as any) * 1 <= 5)
                    usedKeys.push(keys[i]);
            }
        }
    }

    return _.trim(usedKeys.filter(f => f !== 'id').map(f => {
        return formatSingleString(e, f, _.get(colDef, 'columns'));
    }).join(' • ').replace(/ •  • /ig, ' • '), ' • ');
}

const formatSingleString = (e, f, cdef) => {
    if (!e) return '';
    if (typeof e[f] === 'object' && e[f] !== null) {
        const kef = Object.keys(e[f]);
        return kef.map(k => {
            if (typeof e[f][k] === 'object') {
                return formatSingleString(e[f], k, _.get(cdef, k));
            }
            return e[f][k];
        }).join(' • ');
    }
    const cd = _.get(cdef, f)
    if (cd) {
        const type = cd.data_type;
        switch (type) {
            case "timestamp without time zone":
            case "timestamp with time zone":
                return dateFormat(e[f]);
            case "date":
                return dateFormat(e[f], 'dd MMM yyyy');
        }
    }

    return e && e[f];
}

const getQuery = (props) => {
    const { tablename, labelField, auth, value, setValue, label, relation } = props;
    let query = '';
    if (relation && relation.query) {
        query = relation.query;
    } else {
        query = ':::' + tablename;
    }
    return query;
}
const loadList = async (props) => {
    const { tablename, labelField, auth, value, setValue, label, relation } = props;
    let queryIndex = getQuery(props);
    let query = queryIndex;
    if (queryIndex.indexOf(':::') === 0) {
        await loadColDefs(tablename);
        const cols = columnDefs[tablename];
        if (cols) {
            query = `query { ${tablename} {
                    id
                    ${cols
                    .map(e => e.column_name)
                    .filter(e => e != 'id' && e.indexOf('id') !== 0)
                    .join('\n')}
                }}`;
        }
    }

    if (!queryIndex) { return; }
    if (!queryCache[queryIndex]) {
        const rawList = await queryAll(query, { auth });
        queryCache[queryIndex] = await Promise.all(rawList.map(async e => {
            if (relation && relation.label) {
                if (typeof relation.label === 'function') {
                    let labelResult = relation.label(e);
                    if (labelResult instanceof Promise) {
                        labelResult = await labelResult;
                    }

                    return {
                        value: relation.id ? e[relation.id] : e['id'],
                        label: labelResult
                    };
                } else {
                    return {
                        value: relation.id ? e[relation.id] : e['id'],
                        label: _.get(e, relation.label)
                    };
                }
            } else {
                const keys = Object.keys(e);

                let lfield = '';
                if (typeof labelField === 'string') {
                    lfield = labelField;
                } else if (typeof labelField === 'function') {
                    lfield = labelField(e);
                } else {
                    if (keys.length > 0) {
                        return {
                            value: e['id'],
                            label: formatRelationLabel(keys, e)
                        }
                    }
                }

                return {
                    value: e['id'],
                    label: e[lfield]
                };
            }
        }));

    }

    return queryCache[queryIndex];
}