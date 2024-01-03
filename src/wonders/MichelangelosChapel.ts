import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class MichelangelosChapel extends BaseWonder {
  type = Wonder.MichelangelosChapel
  requires = Advance.Religion
  production = 300
  obsoleteBy = Advance.Communism
}