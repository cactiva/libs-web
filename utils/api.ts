import axios from "axios";
const config = require("../../settings.json");

export default (e: any) => {
  let url = e.url;
  if (e.url.indexOf("http") !== 0) {
    url = `${config.backend.protocol}://${config.backend.host}:${config.backend.port}${e.url}`;
  }
  let onError = (a: any) => { };
  if (e.onError) {
    onError = e.onError;
  }

  return new Promise(async (resolve, reject) => {
    try {
      const res = await axios({ ...e, url });
      if (res.status >= 200 && res.status < 300) {
        if (res.data) resolve(res.data);
        else resolve(res);
      } else {
        if (res.data) onError(res.data);
        else onError(res); 
      }
    } catch (e) {
      if (onError) {
        if (e.response && e.response.data) onError(e.response.data);
        else onError(e.response);
      } else {
        if (e.response && e.response.data) resolve(e.response.data);
        else resolve(e.response);
      }
    }
  });
};
