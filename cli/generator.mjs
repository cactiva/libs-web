import gql from "graphql-tag";
import _ from "lodash";
import path from "path";
import morph from "ts-morph";
import {
  generateCrudActions,
  generateCrudForm,
  generateCrudTable,
  generateCrudTitle,
} from "./gencrud.mjs";
import { generateSource } from "./gensource.mjs";
import { SyntaxKind } from "./syntaxkinds.mjs";
import { getQuery, parseTable, getReturn } from "./util.mjs";
import { replaceRange } from "./util.mjs";
import prettier from "prettier";

if (process.argv.length <= 2) {
  console.log("Please provide file path to generate!");
  process.exit();
}

const project = new morph.Project({
  tsConfigFilePath: path.resolve("tsconfig.json"),
});

const sf = project.getSourceFile(process.argv.splice(2).join(" "));
const exec = async (sf) => {
  const rawQuery = getQuery(sf);
  const struct = gql`
    ${rawQuery}
  `;

  const root = _.get(struct, "definitions.0.selectionSet.selections.0");
  const table = parseTable(root);
  const query = { table, var: {}, auth: {} };

  const cw = {
    kind: SyntaxKind.JsxElement,
    name: "CrudWrapper",
    props: {
      data: {
        kind: 73,
        value: "meta.crud",
      },
    },
    children: [],
  };
  cw.children.push(generateCrudTitle(query));
  cw.children.push(generateCrudActions(query));
  cw.children.push(generateCrudTable(query));
  cw.children.push(generateCrudForm(query));
  const h = getReturn(sf);
  if (h) {
    const text = sf.getText();
    const im = `import {
    Button,
    CrudWrapper,
    Field,
    Form,
    Input,
    Table,
    TableColumn,
    TableHead,
    Text,
} from "@src/libs";`;
    let code = `${text.indexOf(im) < 0 ? im : ""}
${replaceRange(
  text,
  h.pos,
  h.end,
  `\nreturn <View>${generateSource(cw)}</View>`
)}`;
    code = prettier.format(code, { parser: "typescript" });
    sf.replaceWithText(code);
  }
  sf.formatText();
  sf.save();
};
exec(sf);
