import Advance from "../advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class Bank extends BaseBuilding {
  static type = Building.Bank
  static production = 120
  static price = 480
  static sell = 120
  static maintenance = 3
  static requires = Advance.Banking
}