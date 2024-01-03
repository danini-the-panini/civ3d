import Advance from "../advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class Marketplace extends BaseBuilding {
  static type = Building.Marketplace
  static production = 80
  static price = 320
  static sell = 80
  static maintenance = 1
  static requires = Advance.Currency
}