import {FluxActionExtend, StandardAction, AnyObject, AnyObjectOrString} from './types'

export function isPromise(val: any): boolean {
  return val && typeof val.then === 'function';
}

function defaultDataGetter(result: AnyObject, action: StandardAction): FluxActionExtend | Promise<FluxActionExtend> {
  const payload = result;
  const meta = {};
  return {
    payload,
    meta,
  };
}

let dataGetterOverride: typeof defaultDataGetter | undefined;

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
export function dataGetter(result: AnyObject, action: StandardAction, useDefault = false) {
  if (!!dataGetterOverride && !useDefault) {
    return dataGetterOverride(result, action)
  }
  return defaultDataGetter(result, action)
}

function defaultErrorGetter(error: AnyObjectOrString, action: StandardAction): AnyObjectOrString | Promise<AnyObjectOrString> {
  return error;
}

let errorGetterOverride: typeof defaultErrorGetter | undefined;

/**
 * Override for errorGetter, use it if you need another behaviour
 * @param errorGetter
 */
export function setErrorGetter(errorGetter: typeof defaultErrorGetter) {
  errorGetterOverride = errorGetter;
}

/**
 * Response error resolver
 * @param error
 * @param action - original action
 * @param useDefault - call with default dataGetter
 * @returns {{payload: *, meta: *}}
 */
export function errorGetter(error: AnyObject, action: StandardAction, useDefault = false) {
  if (!!errorGetterOverride && !useDefault) {
    return errorGetterOverride(error, action)
  }
  return defaultErrorGetter(error, action);
}

export function restoreDefaults() {
  errorGetterOverride = undefined;
  dataGetterOverride = undefined;
}
