import Advance from "../Advances";
import BaseAirUnit from "./BaseAirUnit";
import { Unit } from "./BaseUnit";

export default class Nuclear extends BaseAirUnit {
  static type = Unit.Nuclear
  static production = 160
  static price = 3200
  static attack = 99
  static defense = 0
  static movement = 16
  static requires = Advance.Rocketry
}