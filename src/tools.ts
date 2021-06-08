import {FluxActionExtend, StandardAction, AnyObject} from './types'

export function isPromise(val: any): boolean {
  return val && typeof val.then === 'function';
}

function defaultDataGetter(result: AnyObject, action: StandardAction): FluxActionExtend {
  let payload;
  let meta;

  payload = result;
  meta = {};
  return {
    payload,
    meta,
  };
}

let dataGetterOverride: typeof defaultDataGetter;

/**
 * Override for dataGetter, use it if you need another behaviour
 * @param dataGetter
 */
export function setDataGetter(dataGetter: typeof defaultDataGetter) {
  dataGetterOverride = dataGetter;
}

/**
 * Response data resolver
 * @param result - promise resolve
 * @param action - original action
 * @param useDefault - call with default dataGetter
 * @returns {{payload: *, meta: *}}
 */
export function dataGetter(result: AnyObject, action: StandardAction, useDefault = false): FluxActionExtend {
  if (!!dataGetterOverride && !useDefault) {
    return dataGetterOverride(result, action)
  }
  let payload;
  let meta;

  payload = result;
  meta = {};
  return {
    payload,
    meta,
  };
}
