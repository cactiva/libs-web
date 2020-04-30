import _ from "lodash";
import { SyntaxKind } from "./syntaxkinds.mjs";

export const generateExpression = (node) => {
  const rawResult = generateExpressionArray(node);
  const result = [""];
  rawResult.map((r) => {
    if (typeof r === "string") {
      if (typeof result[result.length - 1] === "string") {
        result[result.length - 1] = result[result.length - 1] + r;
        return;
      }
    }

    if (Array.isArray(r)) {
      r.map((rr) => {
        result.push(rr);
      });
      return;
    }

    result.push(r);
  });

  return result;
};

export const getToken = (op) => {
  switch (op) {
    case SyntaxKind.OpenBraceToken:
      return "{";
    case SyntaxKind.CloseBraceToken:
      return "}";
    case SyntaxKind.OpenParenToken:
      return "(";
    case SyntaxKind.CloseParenToken:
      return ")";
    case SyntaxKind.OpenBracketToken:
      return "[";
    case SyntaxKind.CloseBracketToken:
      return "]";
    case SyntaxKind.DotToken:
      return ".";
    case SyntaxKind.DotDotDotToken:
      return "...";
    case SyntaxKind.SemicolonToken:
      return ";";
    case SyntaxKind.CommaToken:
      return ",";
    case SyntaxKind.GreaterThanToken:
      return ">";
    case SyntaxKind.LessThanToken:
      return "<";
    case SyntaxKind.LessThanSlashToken:
      return "</";
    case SyntaxKind.GreaterThanEqualsToken:
      return ">=";
    case SyntaxKind.EqualsEqualsToken:
      return "==";
    case SyntaxKind.EqualsEqualsEqualsToken:
      return "===";
    case SyntaxKind.ExclamationEqualsToken:
      return "!=";
    case SyntaxKind.ExclamationEqualsEqualsToken:
      return "!==";
    case SyntaxKind.EqualsGreaterThanToken:
      return "=>";
    case SyntaxKind.PlusToken:
      return "+";
    case SyntaxKind.MinusToken:
      return "-";
    case SyntaxKind.AsteriskToken:
      return "*";
    case SyntaxKind.AsteriskAsteriskToken:
      return "**";
    case SyntaxKind.SlashToken:
      return "/";
    case SyntaxKind.PercentToken:
      return "%";
    case SyntaxKind.PlusPlusToken:
      return "++";
    case SyntaxKind.MinusMinusToken:
      return "--";
    case SyntaxKind.LessThanLessThanEqualsToken:
      return "<<";
    case SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
      return ">>";
    case SyntaxKind.AmpersandToken:
      return "&";
    case SyntaxKind.BarToken:
      return "|";
    case SyntaxKind.CaretToken:
      return "^";
    case SyntaxKind.ExclamationToken:
      return "!";
    case SyntaxKind.TildeToken:
      return "~";
    case SyntaxKind.AmpersandAmpersandToken:
      return "&&";
    case SyntaxKind.BarBarToken:
      return "||";
    case SyntaxKind.QuestionToken:
      return "?";
    case SyntaxKind.ColonToken:
      return ":";
    case SyntaxKind.AtToken:
      return "@";
    case SyntaxKind.BacktickToken:
      return "`";
    case SyntaxKind.EqualsToken:
      return "=";
    case SyntaxKind.PlusEqualsToken:
      return "+=";
    case SyntaxKind.MinusEqualsToken:
      return "-=";
    case SyntaxKind.AsteriskEqualsToken:
      return "*=";
    case SyntaxKind.AsteriskAsteriskEqualsToken:
      return "**=";
    case SyntaxKind.SlashEqualsToken:
      return "/=";
    case SyntaxKind.PercentEqualsToken:
      return "%=";
    case SyntaxKind.LessThanLessThanEqualsToken:
      return "<<=";
    case SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
      return ">>=";
    case SyntaxKind.AmpersandEqualsToken:
      return "&=";
    case SyntaxKind.BarEqualsToken:
      return "|=";
    case SyntaxKind.CaretEqualsToken:
      return "^=";
  }
  return null;
};

const isNodeACondition = (node, path) => {
  const v = _.get(node, path);
  if (v) {
    return (
      v.kind === SyntaxKind.BinaryExpression ||
      v.kind === SyntaxKind.ConditionalExpression
    );
  }
  return false;
};

export const generateExpressionArray = (node, opt) => {
  if (!node) return [""];
  const kind = node.kind;

  switch (kind) {
    case SyntaxKind.VariableDeclaration:
      return [
        `const ${node.name} = `,
        generateExpressionArray(node.value, opt),
        `}`,
      ];
    case SyntaxKind.PropertyAccessExpression:
      return [node.value];
    case SyntaxKind.ExpressionStatement:
      return generateExpressionArray(node.value, opt);
    case SyntaxKind.AwaitExpression:
      return [`await `, generateExpressionArray(node.value, opt)];
    case SyntaxKind.BinaryExpression:
      if (opt && opt.conditionOnly) {
        return [
          node.left,
          " " + getToken(node.operator) + " ",
          generateExpressionArray(node.right, opt),
        ];
      }

      if (getToken(node.operator) === "&&") {
        if (node.right.kind === SyntaxKind.JsxElement) {
          return ["if (", node.left, ") then ", node.right];
        } else {
          return [node.left, " && ", generateExpressionArray(node.right, opt)];
        }
      }
      return [node.left, " " + getToken(node.operator) + " ", node.right];
    case SyntaxKind.NumericLiteral:
    case SyntaxKind.StringLiteral:
      return [`${node.value}`];
    case SyntaxKind.CallExpression:
      const args = [];
      node.arguments.map((i) => {
        args.push(generateExpressionArray(i));
        args.push(", ");
      });
      if (args.length > 0) args.pop();
      return [node.expression, `(`, ...args, `)`];
    case SyntaxKind.PropertyAccessExpression:
      return [node.value];
    case SyntaxKind.ArrayLiteralExpression:
      return (() => {
        const result = [];
        const keys = _.keys(node.value);
        keys.map((key, idx) => {
          if (key.indexOf("_spread_") === 0) {
            result.push(`...`);
            result.push(generateExpressionArray(node.value[key]));
          } else {
            const isFirstKey = idx === 0;
            const child = generateExpressionArray(node.value[key]);
            result.push(`${!isFirstKey ? "," : ""}`);
            child.map((v) => result.push(child));
          }
        });
        return [`[`, ...result, `]`];
      })();
    case SyntaxKind.ObjectLiteralExpression:
      return (() => {
        const result = [];
        const keys = _.keys(node.value);
        keys.map((key, idx) => {
          if (key.indexOf("_spread_") === 0) {
            result.push(`...`);
            result.push(generateExpressionArray(node.value[key]));
          } else {
            const isFirstKey = idx === 0;
            const child = generateExpressionArray(node.value[key]);
            result.push(`${!isFirstKey ? "," : ""}"${key}":`);
            child.map((v) => result.push(v));
          }
        });
        return [`{\n`, ...result, `\n}`];
      })();
    case SyntaxKind.AsExpression:
      return [...generateExpressionArray(node.value, opt), ` as any`];
    case SyntaxKind.ConditionalExpression:
      let result = [];

      if (opt && opt.conditionOnly) {
        result = [
          ...generateExpressionArray(node.condition),
          " && ",
          ...generateExpressionArray(node.whenTrue),
        ];
      } else {
        if (isNodeACondition(node, "whenTrue.value")) {
          result = [
            "if (",
            ...generateExpressionArray(node.condition),
            " && ",
            ...generateExpressionArray(node.whenTrue, {
              ...opt,
              conditionOnly: true,
            }),
            ")  ",
          ];
        } else {
          result = [
            "if (",
            ...generateExpressionArray(node.condition),
            ") then ",
            ...generateExpressionArray(node.whenTrue),
          ];
        }
      }

      if (isNodeACondition(node, "whenFalse.value")) {
        result = [
          ...result,
          " else if ",
          ...generateExpressionArray(node.whenFalse, {
            ...opt,
            conditionOnly: true,
          }),
          " ",
        ];
      } else {
        result = [
          ...result,
          " else ",
          ...generateExpressionArray(node.whenFalse, opt),
          " ",
        ];
      }

      return result;
    case SyntaxKind.JsxFragment:
      return [`<>`, ...node.children, `</>`];
    case SyntaxKind.JsxExpression:
      return [`{`, ...generateExpressionArray(node.value, opt), `}`];
    case SyntaxKind.ElementAccessExpression:
      if (node.exp.value.kind === SyntaxKind.AsExpression) {
        return [
          `switch (`,
          ...generateExpressionArray(node.argExp),
          `) `,
          ...generateExpressionArray(node.exp.value.value),
        ];
      } else {
        return [
          ...generateExpressionArray(node.exp),
          `[`,
          ...generateExpressionArray(node.argExp),
          `]`,
        ];
      }
    case SyntaxKind.ParenthesizedExpression:
      return [`(`, ...generateExpressionArray(node.value, opt), `)`];
    case SyntaxKind.ReturnStatement:
      return [`return `, ...generateExpressionArray(node.value, opt)];
    case SyntaxKind.ArrowFunction:
      return (() => {
        const result = [];
        const async = _.indexOf(node.modifiers, SyntaxKind.AsyncKeyword) >= 0;
        result.push(`${async ? "async " : ""}(${node.params.join(",")}) => {`);
        node.body.map((e) => {
          const childs = generateExpressionArray(e);
          childs.map((c) => {
            result.push(c);
          });
        });
        result.push(`})`);
        return result;
      })();
  }

  if (typeof node === "object" && node.value) return [node.value];
  return [node];
};
