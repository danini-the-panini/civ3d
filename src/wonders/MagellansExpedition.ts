import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class MagellansExpedition extends BaseWonder {
  type = Wonder.MagellansExpedition
  requires = Advance.Navigation
  production = 400
}