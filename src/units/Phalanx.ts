import Advance from "../advances";
import BaseLandUnit from "./BaseLandUnit";
import { Unit } from "./BaseUnit";

export default class Phalanx extends BaseLandUnit {
  static type = Unit.Phalanx
  static production = 20
  static price = 120
  static attack = 1
  static defense = 2
  static requires = Advance.BronzeWorking
}