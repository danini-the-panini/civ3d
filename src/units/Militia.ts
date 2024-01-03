import BaseLandUnit from "./BaseLandUnit";
import { Unit } from "./BaseUnit";

export default class Militia extends BaseLandUnit {
  static type = Unit.Militia
  static production = 10
  static price = 50
  static attack = 1
  static defense = 1
}