import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class HooverDam extends BaseWonder {
  type = Wonder.HooverDam
  requires = Advance.Electronics
  production = 600
}