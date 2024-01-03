import Advance from "../advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class NuclearPlant extends BaseBuilding {
  static type = Building.NuclearPlant
  static production = 160
  static price = 640
  static sell = 160
  static maintenance = 2
  static requires = Advance.NuclearPower
}