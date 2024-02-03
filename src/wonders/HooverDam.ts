import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class HooverDam extends BaseWonder {
  static type = Wonder.HooverDam
  static requires = Advance.Electronics
  static production = 600
}