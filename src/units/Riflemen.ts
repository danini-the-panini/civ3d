import Advance from "../Advances";
import BaseLandUnit from "./BaseLandUnit";
import { Unit } from "./BaseUnit";

export default class Riflemen extends BaseLandUnit {
  static type = Unit.Riflemen
  static production = 30
  static price = 210
  static attack = 3
  static defense = 5
  static requires = Advance.Conscription
}