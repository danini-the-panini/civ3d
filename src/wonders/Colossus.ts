import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class Colossus extends BaseWonder {
  static type = Wonder.Colossus
  static requires = Advance.BronzeWorking
  static production = 200
  static obsoleteBy = Advance.Electricity
}