import Advance from "../advances";
import BaseSeaUnit from "./BaseSeaUnit";
import { Unit } from "./BaseUnit";

export default class Trireme extends BaseSeaUnit {
  static type = Unit.Trireme
  static production = 40
  static price = 320
  static attack = 1
  static defense = 0
  static movement = 3
  static capacity = 2
  static requires = Advance.MapMaking
}