import Advance from "../advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class Granary extends BaseBuilding {
  static type = Building.Granary
  static production = 60
  static price = 240
  static sell = 60
  static maintenance = 1
  static requires = Advance.Pottery
}