import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class UnitedNations extends BaseWonder {
  static type = Wonder.UnitedNations
  static requires = Advance.Communism
  static production = 600
}