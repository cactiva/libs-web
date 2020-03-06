import { querySQLSingle, querySQLAll } from "@src/libs/utils/sql";
import { toJS } from "mobx";
import { observer, useObservable } from "mobx-react-lite";
import React from "react";
import { View, Table, Button } from "react-native";
import useAsyncEffect from "use-async-effect";
import _ from "lodash";

let ExcelFile;
let ExcelColumn;
let ExcelSheet;

export default observer((props?:any) => {
  const meta = useObservable({
    excel_data: null as any,
    excel_label: null as any,
    excel_render: null as any
  });

  useAsyncEffect(async () => {
    console.log('propsnya', props);
    const ReactExport = (await import("react-export-excel")).modules;
    ExcelFile = ReactExport.ExcelFile;
    ExcelColumn = ReactExport.ExcelColumn;
    ExcelSheet = ReactExport.ExcelSheet;
  }, []);

  useAsyncEffect(async () => {
    meta.excel_data = await getReportPlanTonnage();
    console.log('ada ga?', toJS(meta.excel_data));
    meta.excel_label = meta.excel_data && Object.keys(meta.excel_data[0]);
    meta.excel_render = (
      <View>
      <ExcelFile hideElement={true} filename="Excel Mantap">
        {meta.excel_data && meta.excel_label && (
          <ExcelSheet data={meta.excel_data} name="Data Report Plan">
            {
              meta.excel_label.map((val, key)=>{
                return (<ExcelColumn label={val} key={key} value={r => r[val]}/>)
              })
            }
          </ExcelSheet>
        )}
      </ExcelFile>
      </View>
    );

  }, []);

  if(meta.excel_render) return meta.excel_render;
});


const getReportPlanTonnage = async () => {
  return await querySQLAll(
    `SELECT *
    FROM v_report_plan_tonnage`,
    {
      auth: true,
      onError: e => console.log(e)
    }
  );
};