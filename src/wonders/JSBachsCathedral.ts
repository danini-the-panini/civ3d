import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class JSBachsCathedral extends BaseWonder {
  type = Wonder.JSBachsCathedral
  requires = Advance.Religion
  production = 400
}