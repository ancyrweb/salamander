export const configurable = (klass, configure) => {
  klass.__smcfgr__ = configure;
  return klass;
};
