import Advance from "../Advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class University extends BaseBuilding {
  static type = Building.University
  static production = 160
  static price = 640
  static sell = 160
  static maintenance = 3
  static requires = Advance.University
}