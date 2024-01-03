import Advance from "../advances";
import BaseSeaUnit from "./BaseSeaUnit";
import { Unit } from "./BaseUnit";

export default class Frigate extends BaseSeaUnit {
  static type = Unit.Frigate
  static production = 40
  static price = 320
  static attack = 2
  static defense = 2
  static movement = 3
  static capacity = 4
  static requires = Advance.Magnetism
}