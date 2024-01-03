import Advance from "../advances";
import BaseLandUnit from "./BaseLandUnit";
import { Unit } from "./BaseUnit";

export default class Artillery extends BaseLandUnit {
  static type = Unit.Artillery
  static production = 60
  static price = 600
  static attack = 12
  static defense = 2
  static movement = 2
  static requires = Advance.Robotics
}