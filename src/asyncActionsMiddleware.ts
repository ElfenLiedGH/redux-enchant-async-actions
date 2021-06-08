import {Middleware, AnyAction, Dispatch} from 'redux'
import {isPromise, dataGetter} from './tools'

const asyncActionsMiddleware: Middleware<{}, AnyAction, Dispatch> = ({dispatch}) => (next) =>
  (action) => {
    if (isPromise(action.payload)) {
      action.payload
        .then((res: any) => {
          const {payload, meta} = dataGetter(res, action);
          action.payload = payload;
          action.meta = {
            ...action.meta,
            ...meta,
            loading: false,
          };
          action.error = undefined;
          return dispatch(action);
        })
        .catch((error: any) => {
          if (action.meta) {
            action.meta.loading = false;
          } else {
            action.meta = {loading: false};
          }
          action.error = true;
          action.payload = error;
          return dispatch(action);
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
