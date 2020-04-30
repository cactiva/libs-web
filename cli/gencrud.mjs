import _ from "lodash";
import { SyntaxKind } from "./syntaxkinds.mjs";

export const generateCrudTable = (query) => {
  const struct = {
    kind: SyntaxKind.JsxElement,
    name: "Table",
    props: {},
    children: [
      {
        kind: SyntaxKind.JsxElement,
        name: "TableHead",
        props: {},
        children: [
          {
            kind: SyntaxKind.JsxElement,
            name: "TableColumn",
            props: {},
            children: [],
          },
        ],
      },
      {
        kind: SyntaxKind.JsxElement,
        name: "TableRow",
        props: {},
        children: [
          {
            kind: SyntaxKind.JsxElement,
            name: "TableColumn",
            props: {},
            children: [],
          },
        ],
      },
    ],
  };
  struct.props.columnMode = {
    kind: 10,
    value: `"manual"`,
  };
  const columnsHead = [];
  _.map(query.table.fields, (f) => {
    if (f.name === "id") return;
    columnsHead.push({
      kind: SyntaxKind.JsxElement,
      name: "TableColumn",
      props: {
        path: {
          kind: 10,
          value: `"${f.name}"`,
        },
        title: {
          kind: 10,
          value: `"${_.startCase(f.name)}"`,
        },
      },
      children: [],
    });
  });
  _.set(struct, "children.0.children", columnsHead);
  delete struct.children[1];
  return struct;
};

export const generateCrudForm = (query, params) => {
  const struct = {
    kind: SyntaxKind.JsxElement,
    name: "Form",
    props: {},
    children: [],
  };

  const fields = [];
  _.map(query.table.fields, (f) => {
    fields.push({
      kind: SyntaxKind.JsxElement,
      name: "Field",
      props: {
        label: {
          kind: 10,
          value: `"${_.startCase(f.name)}"`,
        },
        path: {
          kind: 10,
          value: `"${f.name}"`,
        },
      },
      children: [
        {
          kind: SyntaxKind.JsxElement,
          name: "Input",
          props: {
            type: {
              kind: SyntaxKind.StringLiteral,
              value: `"text"`,
            },
          },
          children: [],
        },
      ],
    });
  });

  _.set(
    struct,
    "children",
    fields.filter((e) => {
      if (e.props.path.value === '"id"') return false;
      return true;
    })
  );
  return {
    kind: 271,
    value: {
      kind: 198,
      params: ['mode: "create" | "edit"', "events", ...(params || [])],
      body: [
        {
          kind: 222,
          value: {
            kind: 205,
            left: {
              kind: 190,
              value: "events.afterLoad",
            },
            operator: 60,
            right: {
              kind: 198,
              params: ["form"],
              body: [],
              modifiers: [122],
            },
          },
        },
        {
          kind: 222,
          value: {
            kind: 205,
            left: {
              kind: 190,
              value: "events.beforeSubmit",
            },
            operator: 60,
            right: {
              kind: 198,
              params: ["form", "errors"],
              body: [
                {
                  kind: 231,
                  value: {
                    kind: 103,
                    value: "true",
                  },
                },
              ],
              modifiers: [122],
            },
          },
        },
        {
          kind: 222,
          value: {
            kind: 205,
            left: {
              kind: 190,
              value: "events.afterSubmit",
            },
            operator: 60,
            right: {
              kind: 198,
              params: ["form", "lastInsertId"],
              body: [
                {
                  kind: 231,
                  value: {
                    kind: 103,
                    value: "true",
                  },
                },
              ],
              modifiers: [122],
            },
          },
        },
        {
          kind: 231,
          value: struct,
        },
      ],
    },
  };
};

export const generateCrudActions = (query) => {
  const struct = {
    kind: SyntaxKind.JsxElement,
    name: "View",
    props: {},
    children: [],
  };
  const createButton = (title, type) => {
    const btn = {
      kind: SyntaxKind.JsxElement,
      name: "Button",
      props: {},
      children: [
        {
          kind: SyntaxKind.JsxElement,
          name: "Text",
          props: {},
          children: [{ kind: SyntaxKind.StringLiteral, value: "Button" }],
        },
      ],
    };
    btn.props.type = {
      kind: 10,
      value: `"${type}"`,
    };
    return {
      ...btn,
      children: [
        {
          ...btn.children[0],
          children: [{ kind: SyntaxKind.StringLiteral, value: title }],
        },
      ],
    };
  };

  struct.props["style"] = {
    kind: 189,
    value: {
      flexDirection: {
        kind: 10,
        value: '"row"',
      },
    },
  };

  struct.children = [
    createButton("Create", "create"),
    createButton("Delete", "delete"),
    createButton("Save", "save"),
    createButton("Cancel", "cancel"),
  ];
  return struct;
};

export const generateCrudTitle = (query) => {
  const struct = {
    kind: SyntaxKind.JsxElement,
    name: "Text",
    props: {},
    children: [{ kind: SyntaxKind.StringLiteral, value: "Text" }],
  };
  const title = query.table.name.split("_");
  title.shift();

  struct.children = [
    { kind: SyntaxKind.StringLiteral, value: _.startCase(title.join("_")) },
  ];
  return struct;
};
