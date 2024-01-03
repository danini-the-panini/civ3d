import BaseBuilding, { Building } from "./BaseBuilding";

export default class Barracks extends BaseBuilding {
  static type = Building.Barracks
  static production = 40
  static price = 160
  static sell = 40
  static maintenance = 0 // TODO: depends?
}