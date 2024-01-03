import { Object3D } from 'three'
import Advance from '../advances'
import City from '../City'

export enum Wonder {
  ApolloProgram = 'Apollo Program',
  Colossus = 'Colossus',
  CopernicusObservatory = 'Copernicus\' Observatory',
  CureForCancer = 'Cure for Cancer',
  DarwinsVoyage = 'Darwin\'s Voyage',
  GreatLibrary = 'Great Library',
  GreatWall = 'Great Wall',
  HangingGardens = 'Hanging Gardens',
  HooverDam = 'Hoover Dam',
  IsaacNewtonsCollege = 'Isaac Newton\'s College',
  JSBachsCathedral = 'J.S. Bach\'s Cathedral',
  Lighthouse = 'Lighthouse',
  MagellansExpedition = 'Magellan\'s Expedition',
  ManhattanProject = 'Manhattan Project',
  MichelangelosChapel = 'Michelangelo\'s Chapel',
  Oracle = 'Oracle',
  Pyramids = 'Pyramids',
  SETIProgram = 'SETI Program',
  ShakespearesTheatre = 'Shakespeare\'s Theatre',
  UnitedNations = 'United Nations',
  WomensSuffrage = 'Women\'s Suffrage',
}

export type WonderClass = {
  type: Wonder
  requires: Advance
  obsoleteBy?: Advance
  production: number
  new(...args: any[]): BaseWonder
  createObject(...args: any[]): Object3D
}

export default abstract class BaseWonder {
  static type: Wonder
  static requires: Advance
  static obsoleteBy?: Advance
  static production: number

  constructor(public readonly city: City) {}

  get class(): WonderClass {
    return this.constructor as WonderClass
  }

  get type() {
    return this.class.type
  }
}