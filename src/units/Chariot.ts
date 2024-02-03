import Advance from "../Advances";
import BaseLandUnit from "./BaseLandUnit";
import { Unit } from "./BaseUnit";

export default class Chariot extends BaseLandUnit {
  static type = Unit.Chariot
  static production = 40
  static price = 320
  static attack = 4
  static defense = 1
  static movement = 2
  static requires = Advance.Wheel
}