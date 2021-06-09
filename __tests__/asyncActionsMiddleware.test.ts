import {Store} from 'redux'
import asyncActionsMiddleware from '../src/asyncActionsMiddleware'
import {StandardAction} from '../src/types'
import {setDataGetter, setErrorGetter, restoreDefaults} from '../src/tools'

const create = () => {
  const store: Pick<Store, 'getState' | 'dispatch'> = {
    getState: jest.fn(() => ({})),
    dispatch: (jest.fn())
  }
  const next = jest.fn()

  const invoke = (action: StandardAction) => asyncActionsMiddleware(store)(next)(action)

  return {store, next, invoke}
}

beforeEach(async () => {
  restoreDefaults();
});

it('call common action', () => {
  const {next, invoke} = create()
  const action = {type: 'TEST'}
  invoke(action)
  expect(next).toHaveBeenCalledWith(action)
})

it('call action with promise success', () => {
  const {store, next, invoke} = create()
  const action = {type: 'TEST', payload: new Promise((rs) => rs('ok'))}
  const actionLoading = {
    type: 'TEST', meta: {loading: true}, payload: new Promise<void>(rs => rs())
  }
  const actionSuccess = {type: 'TEST', meta: {loading: false}, payload: 'ok'}
  invoke(action)
  expect(next).toHaveBeenCalledWith(actionLoading)
  return new Promise((rs) => setTimeout(() => rs(
    expect(store.dispatch).toHaveBeenCalledWith(actionSuccess)
  ), 10))
})

it('call action with promise failed', () => {
  const {store, next, invoke} = create()
  const action = {type: 'TEST', payload: new Promise((rs, rj) => rj('error'))}
  const actionLoading = {type: 'TEST', meta: {loading: true}, payload: new Promise<void>(rs => rs())}
  const actionReject = {type: 'TEST', meta: {loading: false}, error: true, payload: 'error'}
  invoke(action)
  expect(next).toHaveBeenCalledWith(actionLoading)
  return new Promise((rs) => setTimeout(() => rs(
    expect(store.dispatch).toHaveBeenCalledWith(actionReject)
  ), 10))
})

it('call action with promise success override dataGetter', () => {
  const {store, next, invoke} = create()
  const action: StandardAction = {type: 'TEST', payload: new Promise((rs) => rs('ok'))}
  setDataGetter(((result, action) => {
    let payload;
    let meta;

    payload = result + action.type + 'dataGetter';
    meta = {};
    return {
      payload,
      meta,
    };
  }))
  const actionLoading = {
    type: 'TEST', meta: {loading: true}, payload: new Promise<void>(rs => rs())
  }
  const actionSuccess = {type: 'TEST', meta: {loading: false}, payload: 'ok' + 'TEST' + 'dataGetter'}
  invoke(action)
  expect(next).toHaveBeenCalledWith(actionLoading)
  return new Promise((rs) => setTimeout(() => rs(
    expect(store.dispatch).toHaveBeenCalledWith(actionSuccess)
  ), 10))
})

it('call action with promise success override async dataGetter', () => {
  const {store, next, invoke} = create()
  const action: StandardAction = {type: 'TEST', payload: new Promise((rs) => rs('ok'))}
  setDataGetter(((result, action) => {
    const payload = result + action.type + 'asyncDataGetter';
    const meta = {};
    return new Promise((rs) => rs({
      payload,
      meta,
    }));
  }))
  const actionLoading = {
    type: 'TEST', meta: {loading: true}, payload: new Promise<void>(rs => rs())
  }
  const actionSuccess = {type: 'TEST', meta: {loading: false}, payload: 'ok' + 'TEST' + 'asyncDataGetter'}
  invoke(action)
  expect(next).toHaveBeenCalledWith(actionLoading)
  return new Promise((rs) => setTimeout(() => rs(
    expect(store.dispatch).toHaveBeenCalledWith(actionSuccess)
  ), 10))
})

it('call action with promise failed override errorGetter', () => {
  const {store, next, invoke} = create()
  const action: StandardAction = {type: 'TEST', payload: new Promise((rs, rj) => rj('error'))}
  const actionLoading: StandardAction = {type: 'TEST', meta: {loading: true}, payload: new Promise<void>(rs => rs())}
  const actionReject: StandardAction = {
    type: 'TEST',
    meta: {loading: false},
    error: true,
    payload: 'error' + 'TEST' + 'errorGetter'
  }
  setErrorGetter(((error, action) => {
    return error + action.type + 'errorGetter';
  }))
  invoke(action)
  expect(next).toHaveBeenCalledWith(actionLoading)
  return new Promise((rs) => setTimeout(() => rs(
    expect(store.dispatch).toHaveBeenCalledWith(actionReject)
  ), 10))
})

it('call action with promise failed override async errorGetter', () => {
  const {store, next, invoke} = create()
  const action: StandardAction = {type: 'TEST', payload: new Promise((rs, rj) => rj('error'))}
  const actionLoading: StandardAction = {type: 'TEST', meta: {loading: true}, payload: new Promise<void>(rs => rs())}
  const actionReject: StandardAction = {
    type: 'TEST',
    meta: {loading: false},
    error: true,
    payload: 'error' + 'TEST' + 'asyncErrorGetter'
  }
  setErrorGetter(((error, action) => {
    return new Promise((rs) => rs(error + action.type + 'asyncErrorGetter'));
  }))
  invoke(action)
  expect(next).toHaveBeenCalledWith(actionLoading)
  return new Promise((rs) => setTimeout(() => rs(
    expect(store.dispatch).toHaveBeenCalledWith(actionReject)
  ), 10))
})
