import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class JSBachsCathedral extends BaseWonder {
  static type = Wonder.JSBachsCathedral
  static requires = Advance.Religion
  static production = 400
}