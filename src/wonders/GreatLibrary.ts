import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class GreatLibrary extends BaseWonder {
  type = Wonder.GreatLibrary
  requires = Advance.Literacy
  production = 300
  obsoleteBy = Advance.Electricity
}