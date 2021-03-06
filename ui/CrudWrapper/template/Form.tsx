import { useWindowSize } from "@src/libs/utils/useWindowSize";
import _ from "lodash";
import { toJS } from "mobx";
import { observer, useLocalStore } from "mobx-react-lite";
import * as React from "react";
import FormContainer from "./form/FormContainer";
import { generateFormField } from "./form/utils/generateFormField";
export default observer((props: any) => {
  const {
    structure,
    form,
    mode,
    colDef,
    auth,
    inmeta,
    parsed,
    isRoot,
    formRef,
    generateForm,
    enableSub,
  } = props;
  const { errors, fkeys } = inmeta;
  const data = inmeta.form;
  const meta = useLocalStore(() => ({
    size: localStorage["cactiva-app-split-size"] || "200",
    resizing: false,
    fields: null as any,
    resizeTimer: 0 as any,
    events: {} as any,
  }));
  const size = useWindowSize();
  React.useEffect(() => {
    if (typeof form === "function" && !meta.fields) {
      meta.events.data = data;
      meta.events.render = async () => {
        const parsedForm = form(mode, meta.events);
        const afterLoad = _.get(meta, "events.afterLoad");
        if (afterLoad) {
          await afterLoad(data);
        }
        meta.fields = generateFormField(
          parsedForm,
          structure,
          colDef,
          fkeys,
          auth,
          errors,
          meta,
          data,
          generateForm,
          meta.events.modifyColumns,
          size.width
        );

        if (inmeta.hasRelation === undefined) {
          inmeta.hasRelation = Object.keys(meta.fields.relations).length > 0;
        }
      };
      meta.events.render();
    }
  }, []);

  React.useEffect(() => {
    if (meta.events.render) {
      meta.events.render();
    }
  }, [props.reloadFormKey]);

  if (
    !meta.fields ||
    inmeta.hasRelation === undefined ||
    typeof form !== "function"
  )
    return null;
 
  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <FormContainer
        formRef={formRef}
        data={data}
        auth={auth}
        mode={mode}
        isRoot={isRoot}
        parsed={parsed}
        enableSub={enableSub}
        events={meta.events}
        fields={toJS(meta.fields)}
      />
    </div>
  );
});
