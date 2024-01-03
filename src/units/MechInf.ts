import Advance from "../advances";
import BaseLandUnit from "./BaseLandUnit";
import { Unit } from "./BaseUnit";

export default class MechInf extends BaseLandUnit {
  static type = Unit.MechInf
  static production = 50
  static price = 450
  static attack = 6
  static defense = 6
  static movement = 3
  static requires = Advance.LaborUnion
}