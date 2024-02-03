import Advance from "../Advances";
import BaseLandUnit from "./BaseLandUnit";
import { Unit } from "./BaseUnit";

export default class Caravan extends BaseLandUnit {
  static type = Unit.Caravan
  static production = 50
  static price = 450
  static attack = 0
  static defense = 1
  static requires = Advance.Trade
}