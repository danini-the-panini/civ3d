import Advance from "../Advances";
import BaseSeaUnit from "./BaseSeaUnit";
import { Unit } from "./BaseUnit";

export default class Sail extends BaseSeaUnit {
  static type = Unit.Sail
  static production = 40
  static price = 320
  static attack = 1
  static defense = 1
  static movement = 3
  static capacity = 3
  static requires = Advance.Navigation
}