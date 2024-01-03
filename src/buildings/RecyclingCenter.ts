import Advance from "../advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class RecyclingCenter extends BaseBuilding {
  static type = Building.RecyclingCenter
  static production = 200
  static price = 800
  static sell = 200
  static maintenance = 2
  static requires = Advance.Recycling
}