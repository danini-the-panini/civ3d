import Advance from "../Advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class Library extends BaseBuilding {
  static type = Building.Library
  static production = 80
  static price = 320
  static sell = 80
  static maintenance = 1
  static requires = Advance.Writing
}