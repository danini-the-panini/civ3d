import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class Oracle extends BaseWonder {
  static type = Wonder.Oracle
  static requires = Advance.Mysticism
  static production = 300
  static obsoleteBy = Advance.Religion
}