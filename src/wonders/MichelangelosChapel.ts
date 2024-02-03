import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class MichelangelosChapel extends BaseWonder {
  static type = Wonder.MichelangelosChapel
  static requires = Advance.Religion
  static production = 300
  static obsoleteBy = Advance.Communism
}