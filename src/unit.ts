import { Point } from "./world"

export enum UnitType {
  Settlers,
  Militia,
  Phalanx,
  Legion,
  Musketeers,
  Riflemen,
  Cavalry,
  Knights,
  Catapult,
  Cannon,
  Chariot,
  Armor,
  MechInf,
  Artillery,
  Diplomat,
  Caravan,
  Trireme,
  Sail,
  Frigate,
  Ironclad,
  Cruiser,
  Battleship,
  Submarine,
  Carrier,
  Transport,
  Fighter,
  Bomber,
  Nuclear
}

export default class Unit {
  type: UnitType
  //player: Player
  position: Point

  constructor(type: UnitType, position: Point) {
    this.type = type
    this.position = position
  }
}