import formatFNS from "date-fns/format";
import parseISO from "date-fns/parseISO";
import id from "date-fns/locale/id";
import enUS from "date-fns/locale/en-US";
import isValid from "date-fns/isValid";

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

export const validateDate = (value: any) => {
  return isValid(parseISO(value));
}

export const getMonthName = (date: any) => {
  var month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";
  const monthName = month[date.getMonth()];
  return monthName;
}