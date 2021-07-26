import isValidCallback from './util/isValidCallback';

const observable = (data) => {
  if (typeof data !== 'object') throw new Error('Data just accept Referrence type');
  let isLockAll = false;
  const listeners = [];
  const lockedProps = [];
  /* register listener function and return unregister of listener*/
  function register(listener) {
    isValidCallback(listener, 'Listener must be a function');
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }
  /* call when data read */
  function onRead(callback = () => {}) {
    isValidCallback(callback);
    callback();
  }
  /* call when data write */
  function onWrite(callback = () => {}) {
    isValidCallback(callback);
    callback();
  }
  /* internal call when mutation operator success */
  function mutationSuccess(...args) {
    listeners.forEach((listener) => {
      listener(...args);
    });
  }

  // lock partial or all fields of data
  function lock(...args) {
    if (args.length === 1 && args[0] === true) {
      isLockAll = true;
      return true;
    }
    if (!args.length) {
      return false;
    }
    args.forEach((prop) => {
      if (typeof prop !== 'string') {
        throw new Error('Each prop should be a string correspond the key of Data');
      }
      listeners.push(prop);
    });
    return true;
  }
  // unlock partial or all fields of data
  function unLock(...args) {
    if (args.length === 1 && args[0] === true) {
      isLockAll = false;
      return true;
    }
    if (!args.length) {
      return false;
    }
    lockedProps = lockedProps.filter((prop) => {
      let isFilter = false;
      args.forEach((rmProp) => {
        if (rmProp === prop) {
          isFilter = true;
        }
      });
      return isFilter;
    });
    return true;
  }
  function isLock(prop) {
    return lockedProps.includes(prop);
  }
  const handler = {
    get(target, prop) {
      onRead();
      return target[prop];
    },
    set(target, prop, value) {
      onWrite();
      if (lockedProps.includes(prop) || isLockAll) {
        return target[prop];
      }
      mutationSuccess(prop, value);
      return (target[prop] = value);
    },
  };

  const proxiedData = new Proxy(data, handler);

  return [proxiedData, { register, lock, unLock, isLock, onRead, onWrite, handler }];
};

/* DEMO */
const myState = { name: 'hoang', age: 21 };

const [state, tools] = observable(myState);

const { unLock, lock, register } = tools;

lock(true);

Reflect.set(state, 'name', 'trung');

console.log(state.name);

unLock(true);

state.name = 'trung';

console.log(state.name);

console.log(Reflect.has(state, 'name'));

console.log(Reflect.ownKeys(state));

const listener1 = (prop, value) => {
  console.log('listener1', { prop, value });
};

const listener2 = (prop, value) => {
  console.log('listener2', { prop, value });
};
register(listener1);
register(listener2);

window.state = state;
