import Advance from "../advances";
import BaseLandUnit from "./BaseLandUnit";
import { Unit } from "./BaseUnit";

export default class Cannon extends BaseLandUnit {
  static type = Unit.Cannon
  static production = 40
  static price = 320
  static attack = 8
  static defense = 1
  static requires = Advance.Metallurgy
}