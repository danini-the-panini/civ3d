import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class MagellansExpedition extends BaseWonder {
  static type = Wonder.MagellansExpedition
  static requires = Advance.Navigation
  static production = 400
}