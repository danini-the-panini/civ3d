import Advance from "../Advances";
import BaseLandUnit from "./BaseLandUnit";
import { Unit } from "./BaseUnit";

export default class Legion extends BaseLandUnit {
  static type = Unit.Legion
  static production = 20
  static price = 120
  static attack = 3
  static defense = 1
  static requires = Advance.IronWorking
}