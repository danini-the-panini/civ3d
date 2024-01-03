import Advance from "../advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class HydroPlant extends BaseBuilding {
  static type = Building.HydroPlant
  static production = 240
  static price = 960
  static sell = 240
  static maintenance = 4
  static requires = Advance.Electronics
}