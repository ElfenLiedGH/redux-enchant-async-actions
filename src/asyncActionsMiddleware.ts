import {Middleware, AnyAction} from 'redux'
import {isPromise, dataGetter, errorGetter} from './tools'
import {AnyObjectOrString, StandardAction} from "./types";

const asyncActionsMiddleware: Middleware<{}, AnyAction> = ({dispatch}) => (next) =>
  (action) => {
    if (isPromise(action.payload)) {
      action.payload
        .then((res: any) => {
          let dataGetterResolve = dataGetter(res, action);
          if (!isPromise(dataGetterResolve)) {
            dataGetterResolve = Promise.resolve(dataGetterResolve)
          }
          return (dataGetterResolve as Promise<StandardAction>)
            .then(({payload, meta}) => {
              action.payload = payload;
              action.meta = {
                ...action.meta,
                ...meta,
                loading: false,
              };
              action.error = undefined;
              return dispatch(action);
            })
        })
        .catch((error: any) => {
          if (action.meta) {
            action.meta.loading = false;
          } else {
            action.meta = {loading: false};
          }
          action.error = true;
          let errorGetterResolve = errorGetter(error, action)
          if (!isPromise(errorGetterResolve)) {
            errorGetterResolve = Promise.resolve(errorGetterResolve);
          }
          ;(errorGetterResolve as Promise<AnyObjectOrString>)
            .then(resolvedError => {
              action.payload = resolvedError;
              return dispatch(action);
            })
            .catch(resolvingError => {
              action.payload = resolvingError;
              return dispatch(action);
            })
        });
      next(Object.assign({}, action, {
        meta: Object.assign({}, action.meta, {
          loading: true
        })
      }));
    } else {
      return next(action);
    }
  };

export default asyncActionsMiddleware;
