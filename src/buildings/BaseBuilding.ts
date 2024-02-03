import { Object3D } from 'three'
import Advance from '../Advances'
import City from '../City'

export enum Building {
  Aqueduct='aqueduct',
  Bank='bank',
  Barracks='barracks',
  Cathedral='cathedral',
  CityWalls='city walls',
  Colosseum='colosseum',
  Courthouse='courthouse',
  Factory='factory',
  Granary='granary',
  HydroPlant='hydroplant',
  Library='library',
  Marketplace='marketplace',
  MassTransit='mass transit',
  MfgPlant='mfg plant',
  NuclearPlant='nuclear plant',
  Palace='palace',
  PowerPlant='powerplant',
  RecyclingCenter='recycling center',
  SDIDefense='sdi defense',
  Temple='temple',
  University='university'
}

export type BuildingClass = {
  type: Building
  production: number
  price: number
  sell: number
  maintenance: number
  requires?: Advance
  new(...args: any[]): BaseBuilding
  createObject(...args: any[]): Object3D
}

export default abstract class BaseBuilding {
  static type: Building
  static production: number
  static price: number
  static sell: number
  static maintenance: number
  static requires?: Advance

  constructor(public readonly city: City) {}

  get class(): BuildingClass {
    return this.constructor as BuildingClass
  }

  get type() {
    return this.class.type
  }
}