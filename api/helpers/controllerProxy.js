const createControllerProxy = controller => {
  return new Proxy(controller, {
    get: (contr, prop) => {
      const valueToGet = contr[prop];

      if (typeof valueToGet === 'function') {
        return valueToGet.bind(contr);
      }

      return valueToGet;
    },
  });
};

export default createControllerProxy;
