export interface Meta {
  loading?: boolean

  [key: string]: any
}

export interface Payload {
  [key: string]: any
}

export interface FluxActionExtend {
  meta: Meta
  payload: Payload
  error?: boolean
}

export interface AnyObject {
  [property: string]: any;
}

export interface StandardAction extends FluxActionExtend {
  type: string
}
