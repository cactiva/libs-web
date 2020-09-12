import * as React from "react";
import { useLocalStore, observer } from "mobx-react-lite";
import ItemButton from "./ItemButton";
import { TextField } from "@fluentui/react/lib/TextField";

export default observer(({ label, field, value, setValue, submit }: any) => {
  const meta = useLocalStore(() => ({
    oldval:
      parseInt(value || "") || ("".toLocaleString().replace(/,/gi, ".") as any),
  }));

  return (
    <ItemButton
      label={label}
      field={field}
      setValue={setValue}
      onClear={submit}
      value={(parseInt(value || "") || "").toLocaleString().replace(/,/gi, ".")}
    >
      <TextField
        value={meta.oldval}
        onChange={(e: any) => {
          meta.oldval = parseInt((e.target.value || "").replace(/\./gi, ""))
            .toLocaleString()
            .replace(/,/gi, ".");
          if (meta.oldval === "NaN") {
            meta.oldval = "";
          }
        }}
        onKeyDown={(e: any) => {
          if (e.which === 13) {
            setValue(parseInt((meta.oldval || "").replace(/\./gi, "")));
            submit();
          }
        }}
        styles={{ root: { padding: 15 } }}
      />
    </ItemButton>
  );
});
