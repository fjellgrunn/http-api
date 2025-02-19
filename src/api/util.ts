
/* eslint-disable no-undefined */
const getParameterValue = (
  value: string | number | boolean | Date | undefined,
): string => {
  if (value) {
    return value instanceof Date ? value.toISOString() : value.toString();
  } else {
    return "";
  }
};

export const generateQueryParameters = (params: {
  [key: string]: string | number | boolean | Date | undefined;
}) =>
  Object.keys(params).length > 0
    ? "?" +
    Object.keys(params)
      .filter((key) =>
        (params[key] !== undefined) &&
        (typeof params[key] === 'string' && (params[key] as string).length === 0) === false
      )
      .map((key) => {
        let value: any;
        if (params[key] === false) {
          value = 'false';
        } else {
          value = params[key];
        }
        return `${key}=${encodeURIComponent(getParameterValue(value))}`
      })
      .join("&")
    : "";
