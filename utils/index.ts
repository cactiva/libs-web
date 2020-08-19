import _ from "lodash";

export const startCase = (str) => {
  let res = (str || "").replace(/_/gi, " ").replace(/\w+/g, (string) => {
    if (string.length <= 2) return string;
    return string.charAt(0).toUpperCase() + string.slice(1);
  });

  if (res.indexOf("m ") === 0) {
    return res.substr(2);
  }
  if (res.indexOf("id ") === 0) {
    return res.substr(3);
  }

  return res;
};

const uuid = (prefix: string = randString()) =>
  `${prefix ? prefix + "-" : ""}${new Date().getTime()}${Math.floor(
    10000000 + Math.random() * 90000000
  )}`;

const randString = (length: number = 5) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  let result = "";
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
const deepFind = (object: object, path: string, defaultValue?: any) =>
  _.get(object, path, defaultValue);

const findLargestSmallest = (a: string, b: string) =>
  a.length > b.length
    ? {
      largest: a,
      smallest: b,
    }
    : {
      largest: b,
      smallest: a,
    };
const fuzzyMatch = (strA: string, strB: string, fuzziness = 0) => {
  if (strA === "" || strB === "") {
    return false;
  }

  if (strA === strB) return true;

  const { largest, smallest } = findLargestSmallest(strA, strB);
  const maxIters = largest.length - smallest.length;
  const minMatches = smallest.length - fuzziness;

  for (let i = 0; i < maxIters; i++) {
    let matches = 0;
    for (let smIdx = 0; smIdx < smallest.length; smIdx++) {
      if (smallest[smIdx] === largest[smIdx + i]) {
        matches++;
      }
    }
    if (matches > 0 && matches >= minMatches) {
      return true;
    }
  }

  return false;
};
const dateToString = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};
const textStyle = (style) => {
  const textStyleProps = [
    "fontSize",
    "color",
    "fontWeight",
    "lineHeight",
    "fontFamily",
    "textAlign",
    "fontStyle",
  ];
  const newTextStyle = {};
  if (!!style)
    Object.keys(style).forEach((k) => {
      if (textStyleProps.indexOf(k) > -1) newTextStyle[k] = style[k];
    });
  return newTextStyle;
};

const capitalizeFLetter = (text: string) => {
  return text[0].toUpperCase() + text.slice(1);
};

const truncateStr = (text: string, length: number) => {
  let string = text.replace(/(\r\n|\n|\r)/gm, "");
  return string.length > length ? string.substr(0, length - 1) + "..." : string;
};

const formatMoney = (number: any, separator?: string, precision?: number) => {
  let v = number;
  if (!separator) separator = ".";
  if (!precision) precision = 12;

  if (typeof v === "string") {
    v = v.replace(/\./gi, "");
  }

  if (typeof v !== "number") {
    v = parseInt(v);
  }

  if (typeof v === "number") {
    v = floatPointer(v, precision);
  }

  if (isNaN(v)) return "";

  return (v as number).toLocaleString().replace(/,/gi, separator);
};

const unformatMoney = (string: any) => {
  return parseInt(string.replace(/\./gi, ""));
};

const floatPointer = (number, precision) => {
  return Math.ceil(Number(parseFloat(number).toPrecision(precision)));
};

const formatSeparatorDec = (value: any, decimal?: number) => {
  if (decimal || decimal === 0) value = Number(value).toFixed(decimal);
  return parseFloat((value || 0).toString().replace(/,/g, "")).toLocaleString('en').replace(/,/gi, ",");
}

export {
  uuid,
  randString,
  deepFind,
  fuzzyMatch,
  dateToString,
  formatMoney,
  unformatMoney,
  textStyle,
  capitalizeFLetter,
  truncateStr,
  formatSeparatorDec
};
