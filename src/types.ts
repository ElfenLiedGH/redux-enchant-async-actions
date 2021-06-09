export type AnyObjectOrString = AnyObject | string

export interface AnyObject {
  [property: string]: any;
}

export interface Meta {
  loading?: boolean

  [key: string]: any
}

export interface FluxActionExtend {
  meta?: Meta
  payload?: AnyObjectOrString | Promise<AnyObjectOrString>
  error?: boolean
}

export interface StandardAction extends FluxActionExtend {
  type: string
}
