import Advance from "../advances";
import BaseLandUnit from "./BaseLandUnit";
import { Unit } from "./BaseUnit";

export default class Knights extends BaseLandUnit {
  static type = Unit.Knights
  static production = 40
  static price = 320
  static attack = 4
  static defense = 2
  static movement = 2
  static requires = Advance.Chivalry
}