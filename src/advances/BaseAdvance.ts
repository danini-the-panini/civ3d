export type AdvanceClass = {
  req1: AdvanceClass
  req2?: AdvanceClass
  new(...args: any[]): BaseAdvance
}

export default abstract class BaseAdvance {
  static req1: AdvanceClass
}