import Advance from "../Advances";
import BaseLandUnit from "./BaseLandUnit";
import { Unit } from "./BaseUnit";

export default class Catapult extends BaseLandUnit {
  static type = Unit.Catapult
  static production = 40
  static price = 320
  static attack = 6
  static defense = 1
  static requires = Advance.Mathematics
}