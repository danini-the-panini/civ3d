import Advance from "../Advances";
import BaseAirUnit from "./BaseAirUnit";
import { Unit } from "./BaseUnit";

export default class Bomber extends BaseAirUnit {
  static type = Unit.Bomber
  static production = 120
  static price = 1920
  static attack = 12
  static defense = 1
  static movement = 8
  static requires = Advance.AdvancedFlight
}