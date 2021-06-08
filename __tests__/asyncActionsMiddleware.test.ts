import asyncActionsMiddleware from 'src/asyncActionsMiddleware'

const create = () => {
  const store = {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn()
  }
  const next = jest.fn()

  const invoke = action => asyncActionsMiddleware(store)(next)(action)

  return {store, next, invoke}
}

it('call common action', () => {
  const {next, invoke} = create()
  const action = {type: 'TEST'}
  invoke(action)
  expect(next).toHaveBeenCalledWith(action)
})

it('call action with promise success', () => {
  const {store, next, invoke} = create()
  const action = {type: 'TEST', payload: new Promise((rs) => rs('ok'))}
  const actionLoading = {type: 'TEST', meta: {loading: true}, payload: new Promise(rs => rs())}
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
  const actionLoading = {type: 'TEST', meta: {loading: true}, payload: new Promise(rs => rs())}
  const actionReject = {type: 'TEST', meta: {loading: false}, error: true, payload: 'error'}
  invoke(action)
  expect(next).toHaveBeenCalledWith(actionLoading)
  return new Promise((rs) => setTimeout(() => rs(
    expect(store.dispatch).toHaveBeenCalledWith(actionReject)
  ), 10))
})
