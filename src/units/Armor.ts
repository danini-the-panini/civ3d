import Advance from "../Advances";
import BaseLandUnit from "./BaseLandUnit";
import { Unit } from "./BaseUnit";

export default class Armor extends BaseLandUnit {
  static type = Unit.Armor
  static production = 80
  static price = 960
  static attack = 50
  static defense = 5
  static movement = 3
  static requires = Advance.Automobile
}