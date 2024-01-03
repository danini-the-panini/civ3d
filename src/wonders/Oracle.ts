import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class Oracle extends BaseWonder {
  type = Wonder.Oracle
  requires = Advance.Mysticism
  production = 300
  obsoleteBy = Advance.Religion
}