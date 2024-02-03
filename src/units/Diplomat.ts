import Advance from "../Advances";
import BaseLandUnit from "./BaseLandUnit";
import { Unit } from "./BaseUnit";

export default class Diplomat extends BaseLandUnit {
  static type = Unit.Diplomat
  static production = 30
  static price = 210
  static attack = 0
  static defense = 0
  static movement = 2
  static requires = Advance.Writing
}