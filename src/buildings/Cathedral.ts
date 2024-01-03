import Advance from "../advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class Cathedral extends BaseBuilding {
  static type = Building.Cathedral
  static production = 160
  static price = 640
  static sell = 160
  static maintenance = 3
  static requires = Advance.Religion
}