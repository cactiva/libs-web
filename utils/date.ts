import formatFNS from "date-fns/format";
import parseISO from "date-fns/parseISO";
import { id, enUS } from "date-fns/locale";

export const dateParse = (value: any) => {
  if (typeof value === "string") {
    return parseISO(value);
  }
  return value;
};
export const dateFormat = (value: any, format?: string) => {
  const locale = "en";
  const inputFormat = format
    ? (format === 'sql' ? 'yyyy-MM-dd HH:mm:ss' : format)
    : "dd MMM yyyy - HH:mm";
  if (typeof value === "string") {
    return formatFNS(parseISO(value), inputFormat, {
      locale: locale === "en" ? enUS : id
    });
  }

  try {
    return formatFNS(value, inputFormat, {
      locale: locale === "en" ? enUS : id
    });
  } catch (e) {
    return value;
  }
};

export const dateOnly = (value: any, format?: string) => {
  const locale = "en";
  const inputFormat = format
    ? (format === 'sql' ? 'yyyy-MM-dd' : format)
    : "dd MMM yyyy";
  if (typeof value === "string") {
    return formatFNS(parseISO(value), inputFormat, {
      locale: locale === "en" ? enUS : id
    });
  }

  try {
    return formatFNS(value, inputFormat, {
      locale: locale === "en" ? enUS : id
    });
  } catch (e) {
    return value;
  }
};

export const timeOnly = (value: any, format?: string) => {
  const locale = "en";
  const inputFormat = format
    ? (format === 'sql' ? 'HH:mm:ss' : format)
    : "HH:mm";
  if (typeof value === "string") {
    return formatFNS(parseISO(value), inputFormat, {
      locale: locale === "en" ? enUS : id
    });
  }

  try {
    return formatFNS(value, inputFormat, {
      locale: locale === "en" ? enUS : id
    });
  } catch (e) {
    return value;
  }
};