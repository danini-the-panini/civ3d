import Advance from "../advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class MfgPlant extends BaseBuilding {
  static type = Building.MfgPlant
  static production = 320
  static price = 1280
  static sell = 320
  static maintenance = 6
  static requires = Advance.Robotics
}