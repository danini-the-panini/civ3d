import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class GreatLibrary extends BaseWonder {
  static type = Wonder.GreatLibrary
  static requires = Advance.Literacy
  static production = 300
  static obsoleteBy = Advance.Electricity
}