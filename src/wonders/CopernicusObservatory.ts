import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class CopernicusObservatory extends BaseWonder {
  static type = Wonder.CopernicusObservatory
  static requires = Advance.Astronomy
  static production = 300
  static obsoleteBy = Advance.Automobile
}