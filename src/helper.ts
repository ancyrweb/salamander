import App from "./kernel/App";
import LoggerInterface from "./service/LoggerInterface";

export const logger = (): LoggerInterface => App.logger;
export const url = () => App.url;
export const configurable = (klass, configure) => {
  klass.__smcfgr__ = configure;
  return klass;
};
