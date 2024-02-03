export enum BiomeType {
  Arctic='arctic',
  Desert='desert',
  Forest='forest',
  Grassland='grassland',
  Hills='hills',
  Jungle='jungle',
  Mountains='mountains',
  Ocean='ocean',
  Plains='plains',
  Rivers='river',
  Swamp='swamp',
  Tundra='tundra',
}

export enum ImpEffect {
  NA,
  Yes,
  Change
}

export interface ImpNA {
  kind: ImpEffect.NA
}

export interface ImpYes {
  kind: ImpEffect.Yes,
  effect: number
}

export interface ImpChange {
  kind: ImpEffect.Change,
  biome: BiomeType
}

export type Imp = ImpNA | ImpYes | ImpChange

const NA: ImpNA = { kind: ImpEffect.NA }

function Yes(effect: number): ImpYes {
  return { kind: ImpEffect.Yes, effect }
}

function Change(biome: BiomeType): ImpChange {
  return { kind: ImpEffect.Change, biome }
}

export default class Biome {
  type: BiomeType

  constructor(type: BiomeType) {
    this.type = type
  }

  get baseAttributes(): [number, number, number] {
    switch (this.type) {
      case BiomeType.Arctic:     return [0, 0, 0]
      case BiomeType.Desert:     return [0, 1, 0]
      case BiomeType.Forest:     return [1, 2, 0]
      case BiomeType.Grassland:  return [2, 0, 0]
      case BiomeType.Hills:      return [1, 0, 0]
      case BiomeType.Jungle:     return [1, 0, 0]
      case BiomeType.Mountains:  return [0, 1, 0]
      case BiomeType.Ocean:      return [1, 0, 2]
      case BiomeType.Plains:     return [1, 1, 0]
      case BiomeType.Rivers:     return [2, 0, 1]
      case BiomeType.Swamp:      return [1, 0, 0]
      case BiomeType.Tundra:     return [1, 0, 0]
    }
  }

  get specialAttributes(): [number, number, number] {
    switch (this.type) {
      case BiomeType.Arctic:    return [2, 0, 0]
      case BiomeType.Desert:    return [3, 1, 0]
      case BiomeType.Forest:    return [3, 2, 0]
      case BiomeType.Grassland: return [2, 1, 0]
      case BiomeType.Hills:     return [1, 2, 0]
      case BiomeType.Jungle:    return [1, 0, 4]
      case BiomeType.Mountains: return [0, 1, 6]
      case BiomeType.Ocean:     return [3, 0, 2]
      case BiomeType.Plains:    return [1, 3, 0]
      case BiomeType.Rivers:    return [2, 1, 1]
      case BiomeType.Swamp:     return [1, 4, 0]
      case BiomeType.Tundra:    return [3, 0, 0]
    }
  }

  get movementCost(): number {
    switch (this.type) {
      case BiomeType.Arctic:    return 2
      case BiomeType.Desert:    return 1
      case BiomeType.Forest:    return 2
      case BiomeType.Grassland: return 1
      case BiomeType.Hills:     return 2
      case BiomeType.Jungle:    return 2
      case BiomeType.Mountains: return 3
      case BiomeType.Ocean:     return 1
      case BiomeType.Plains:    return 1
      case BiomeType.Rivers:    return 1
      case BiomeType.Swamp:     return 2
      case BiomeType.Tundra:    return 1
    }
  }

  get defenseBonus(): [number, number] {
    switch (this.type) {
      case BiomeType.Arctic:    return [0.0, 1.0]
      case BiomeType.Desert:    return [0.0, 1.0]
      case BiomeType.Forest:    return [0.5, 2.0]
      case BiomeType.Grassland: return [0.0, 1.0]
      case BiomeType.Hills:     return [1.0, 2.0]
      case BiomeType.Jungle:    return [0.5, 2.0]
      case BiomeType.Mountains: return [2.0, 5.0]
      case BiomeType.Ocean:     return [0.0, 1.0]
      case BiomeType.Plains:    return [0.0, 1.0]
      case BiomeType.Rivers:    return [0.5, 2.0]
      case BiomeType.Swamp:     return [0.5, 2.0]
      case BiomeType.Tundra:    return [0.0, 1.0]
    }
  }

  get irrigation(): Imp {
    switch (this.type) {
      case BiomeType.Arctic:    return NA
      case BiomeType.Desert:    return Yes(1)
      case BiomeType.Forest:    return Change(BiomeType.Plains)
      case BiomeType.Grassland: return Yes(1)
      case BiomeType.Hills:     return Yes(1)
      case BiomeType.Jungle:    return Change(BiomeType.Grassland)
      case BiomeType.Mountains: return NA
      case BiomeType.Ocean:     return NA
      case BiomeType.Plains:    return Yes(1)
      case BiomeType.Rivers:    return Yes(1)
      case BiomeType.Swamp:     return Change(BiomeType.Grassland)
      case BiomeType.Tundra:    return NA
    }
  }

  get mine(): Imp {
    switch (this.type) {
      case BiomeType.Arctic:    return NA
      case BiomeType.Desert:    return Yes(1)
      case BiomeType.Forest:    return NA
      case BiomeType.Grassland: return Change(BiomeType.Forest)
      case BiomeType.Hills:     return Yes(3)
      case BiomeType.Jungle:    return Change(BiomeType.Forest)
      case BiomeType.Mountains: return Yes(1)
      case BiomeType.Ocean:     return NA
      case BiomeType.Plains:    return Change(BiomeType.Forest)
      case BiomeType.Rivers:    return NA
      case BiomeType.Swamp:     return Change(BiomeType.Forest)
      case BiomeType.Tundra:    return NA
    }
  }

  get roadTrade(): number {
    switch (this.type) {
      case BiomeType.Arctic:    return 0
      case BiomeType.Desert:    return 1
      case BiomeType.Forest:    return 0
      case BiomeType.Grassland: return 1
      case BiomeType.Hills:     return 0
      case BiomeType.Jungle:    return 0
      case BiomeType.Mountains: return 0
      case BiomeType.Ocean:     return 1
      case BiomeType.Plains:    return 1
      case BiomeType.Rivers:    return 0
      case BiomeType.Swamp:     return 0
      case BiomeType.Tundra:    return 0
    }
  }

  score(resource: boolean): number {
    switch (this.type) {
      case BiomeType.Arctic:    return resource ? 6  : 0
      case BiomeType.Desert:    return resource ? 12 : 3
      case BiomeType.Forest:    return resource ? 13 : 7
      case BiomeType.Grassland: return resource ? 8  : 8
      case BiomeType.Hills:     return resource ? 10 : 6
      case BiomeType.Jungle:    return resource ? 3  : 3
      case BiomeType.Mountains: return resource ? 3  : 3
      case BiomeType.Ocean:     return resource ? 11 : 5
      case BiomeType.Plains:    return resource ? 11 : 7
      case BiomeType.Rivers:    return resource ? 7  : 7
      case BiomeType.Swamp:     return resource ? 3  : 3
      case BiomeType.Tundra:    return resource ? 9  : 3
    }
  }
}