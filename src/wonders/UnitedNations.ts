import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class UnitedNations extends BaseWonder {
  type = Wonder.UnitedNations
  requires = Advance.Communism
  production = 600
}