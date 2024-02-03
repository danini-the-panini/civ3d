import Advance from "../Advances";
import BaseSeaUnit from "./BaseSeaUnit";
import { Unit } from "./BaseUnit";

export default class Carrier extends BaseSeaUnit {
  static type = Unit.Carrier
  static production = 160
  static price = 3200
  static attack = 1
  static defense = 12
  static movement = 5
  static los = 2
  static capacity = 8
  static requires = Advance.AdvancedFlight
}