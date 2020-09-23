import { useLocation, navigate } from "@reach/router";
import _ from "lodash";
import { toJS } from "mobx";
import { observer, useLocalStore } from "mobx-react-lite";
import React, { useRef } from "react";
import useAsyncEffect from "use-async-effect";
import { columnDefs } from "..";
import reloadList from "../utils/reloadList";
import reloadStructure from "../utils/reloadStructure";
import Form from "./Form";
import Header from "./Header";
import List from "./List";
import Loading from "./Loading";
import { dateFormat, validateDate } from "../../../utils/date";

export default observer((props: any) => {
  const location = useLocation();
  const {
    parsed,
    afterQuery,
    structure,
    generateForm,
    auth,
    idKey,
    renderHeader,
    isRoot,
    style,
    headerStyle,
    enableSub,
  } = props;
  const { table, form } = parsed;
  const meta = useLocalStore(() => ({
    list: [],
    filter: {
      columns: {},
      initDefault: false,
      form: {},
    },
    paging: {
      current: 0,
    },
    loading: false,
    hasRelation: undefined,
    loadingInitText: "",
    fkeys: structure.fkeys,
    form: {},
    colDefs: [],
    listLoading: true,
    listScroll: { top: 0, left: 0 },
    errors: {},
    reloadFormKey: 0,
    init: false,
    initStructure: false,
    mode: "",
  }));
  const reload = async (resetStructure = false) => {
    if (resetStructure) {
      meta.fkeys = await reloadStructure({
        idKey,
        structure,
        setLoading: (value) => {
          meta.loadingInitText = value;
        },
        reset: true,
      });
      meta.colDefs = _.get(columnDefs, `${structure.name}`, []);
    }

    meta.listLoading = true;
    const resultList = await reloadList({
      structure,
      idKey,
      filter: meta.filter,
      paging: meta.paging,
    });
    if (afterQuery) await afterQuery(resultList);
    meta.list = resultList;
    meta.listLoading = false;
  };
  const parseChildrenData = (data) => {
    if (data.name) {
      data = data.name;
      return data;
    } else {
      const key = Object.keys(data).filter(
        (item) => item.toLowerCase() != "id"
      );
      data = data[key[0]];
      if (Object.keys(data).length > 1) {
        return parseChildrenData(data);
      }
    }
  };

  const path = window.location.pathname;
  const patharr = path.split("/");
  const id = parseInt(patharr[patharr.length - 1]);
  useAsyncEffect(async () => {
    meta.fkeys = await reloadStructure({
      idKey,
      structure,
      setLoading: (value) => {
        meta.loadingInitText = value;
      },
    });
    meta.colDefs = _.get(columnDefs, `${structure.name}`, []);

    if (!isRoot) {
      if (meta.list && meta.list.length === 0) {
        reload();
      }
    }

    if (isRoot) {
      meta.initStructure = true;
    } else {
      meta.init = true;
    }
  }, []);

  useAsyncEffect(async () => {
    if (!isRoot) return;
    await waitUntil(() => meta.initStructure === true);

    if (id) {
      if (meta.form && (meta.form as any).id !== id) {
        const list = await reloadList({
          structure,
          idKey,
          filter: {
            columns: {
              id: {
                default: id,
              },
              initDefault: false,
            },
          },
          paging: meta.paging,
        });

        meta.listLoading = false;

        if (!list) {
          await reload(true);
          window.location.reload();
          return;
        }

        if (list && list.length === 1) {
          meta.form = list[0];
          meta.reloadFormKey++;

          if (meta.mode !== "edit") {
            meta.mode = "edit";
          }
        } else {
          navigate((location.state as any).path);
        }
      }
    } else {
      if (meta.mode !== "") {
        meta.mode = "";
      }

      if (meta.list && meta.list.length === 0) {
        reload();
      }
    }
    meta.init = true;
  }, [window.location.pathname]);

  const colDef: any = {};
  meta.colDefs.map((e: any) => {
    colDef[e.column_name] = e;
  });
  const formRef = useRef(null as any);
  if (Object.keys(colDef).length === 0 || !meta.fkeys || !meta.init) {
    return <Loading text={meta.loadingInitText} />;
  }

  const header = (
    <Header
      structure={structure}
      parsed={parsed}
      form={meta.form}
      isRoot={isRoot}
      setForm={(v) => {
        meta.form = v;
        meta.reloadFormKey++;
      }}
      setErrors={(v) => (meta.errors = v)}
      errors={meta.errors}
      reloadList={reload}
      mode={meta.mode}
      style={headerStyle}
      hasRelation={meta.hasRelation}
      auth={auth}
      idKey={idKey}
      getForm={() => {
        return formRef.current;
      }}
      getList={() => {
        const data = parsed.table.head.children;
        const table_content = data.map((val) => {
          return val.props;
        });
        let list = toJS(meta.list).map((val, key) => {
          let list_data: any = [];
          table_content.map((item) => {
            let data;
            if (item.path.includes("id_")) {
              const m_path = item.path.replace("id_", "m_");
              const t_path = item.path.replace("id_", "t_");
              if (val[m_path]) data = _.get(val, m_path);
              else if (val[t_path]) data = _.get(val, t_path);
              if (data) {
                data = parseChildrenData(data);
              } else {
                data = _.get(val, item.path);
              }
            } else {
              data = _.get(val, item.path);
            }
            if (validateDate(data)) data = dateFormat(data);
            const title = item.title.replace("Id ", "");
            list_data = { ...list_data, [title]: data ? data : "-" };
          });
          return list_data;
        });
        return toJS(list);
      }}
      colDef={colDef}
      reload={reload}
      setLoading={(v: boolean) => (meta.loading = v)}
      setMode={(newmode) => (meta.mode = newmode)}
    />
  );

  const scroll = meta.listScroll;
  const list = meta.list;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", flex: 1, ...style }}
    >
      {renderHeader
        ? renderHeader({
            header,
          })
        : header}
      {meta.mode === "" ? (
        <List
          table={table}
          setMode={(newmode) => (meta.mode = newmode)}
          structure={structure}
          list={list}
          setForm={(v) => {
            meta.form = v;
            meta.reloadFormKey++;
          }}
          filter={meta.filter}
          reload={reload}
          isRoot={isRoot}
          loading={meta.listLoading}
          auth={auth}
          colDef={colDef}
          scroll={scroll}
          setScroll={(v) => {
            meta.listScroll = v;
          }}
          fkeys={meta.fkeys}
        />
      ) : (
        <Form
          form={form}
          colDef={colDef}
          generateForm={generateForm}
          parsed={parsed}
          structure={structure}
          hasRelation={meta.hasRelation}
          inmeta={meta}
          isRoot={isRoot}
          setHasRelation={(v) => (meta.hasRelation = v)}
          formRef={formRef}
          reloadFormKey={meta.reloadFormKey}
          mode={meta.mode}
          enableSub={enableSub}
        />
      )}
    </div>
  );
});

export const waitUntil = (f: any): Promise<boolean> => {
  return new Promise((resolve) => {
    const ival = setInterval(() => {
      if (f()) {
        clearInterval(ival);
        resolve(true);
      }
    }, 10);
  });
};
