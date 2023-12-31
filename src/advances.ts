enum Advance {
  AdvancedFlight='Advanced Flight',
  Alphabet='Alphabet',
  Astronomy='Astronomy',
  AtomicTheory='Atomic Theory',
  Automobile='Automobile',
  Banking='Banking',
  BridgeBuilding='Bridge Building',
  BronzeWorking='Bronze Working',
  CeremonialBurial='Ceremonial Burial',
  Chemistry='Chemistry',
  Chivalry='Chivalry',
  CodeOfLaws='Code of Laws',
  Combustion='Combustion',
  Communism='Communism',
  Computers='Computers',
  Conscription='Conscription',
  Construction='Construction',
  Corporation='Corporation',
  Currency='Currency',
  Democracy='Democracy',
  Electricity='Electricity',
  Electronics='Electronics',
  Engineering='Engineering',
  Explosives='Explosives',
  Feudalism='Feudalism',
  Flight='Flight',
  FusionPower='Fusion Power',
  FutureTech='Future Tech',
  GeneticEngineering='Genetic Engineering',
  Gunpowder='Gunpowder',
  HorsebackRiding='Horseback Riding',
  Industrialization='Industrialization',
  Invention='Invention',
  IronWorking='Iron Working',
  Irrigation='Irrigation',
  LaborUnion='Labor Union',
  Literacy='Literacy',
  Magnetism='Magnetism',
  MapMaking='Map Making',
  Masonry='Masonry',
  MassProduction='Mass Production',
  Mathematics='Mathematics',
  Medicine='Medicine',
  Metallurgy='Metallurgy',
  Mining='Mining',
  Monarchy='Monarchy',
  Mysticism='Mysticism',
  Navigation='Navigation',
  NuclearFission='Nuclear Fission',
  NuclearPower='Nuclear Power',
  Philosophy='Philosophy',
  Physics='Physics',
  Plastics='Plastics',
  Pottery='Pottery',
  RailRoad='Rail Road',
  Recycling='Recycling',
  Refining='Refining',
  Religion='Religion',
  Republic='Republic',
  Roads='Roads',
  Robotics='Robotics',
  Rocketry='Rocketry',
  SpaceFlight='Space Flight',
  SteamEngine='Steam Engine',
  Steel='Steel',
  Superconductor='Superconductor',
  TheoryOfGravity='Theory of Gravity',
  Trade='Trade',
  University='University',
  Wheel='Wheel',
  Writing='Writing'
}

export const Requirements: Record<Advance, Advance[]> = {
  [Advance.AdvancedFlight]: [Advance.Flight, Advance.Electricity],
  [Advance.Alphabet]: [],
  [Advance.Astronomy]: [Advance.Mysticism, Advance.Mathematics],
  [Advance.AtomicTheory]: [Advance.TheoryOfGravity, Advance.Physics],
  [Advance.Automobile]: [Advance.Combustion, Advance.Steel],
  [Advance.Banking]: [Advance.Republic, Advance.Trade],
  [Advance.BridgeBuilding]: [Advance.IronWorking, Advance.Construction],
  [Advance.BronzeWorking]: [],
  [Advance.CeremonialBurial]: [],
  [Advance.Chemistry]: [Advance.Medicine, Advance.University],
  [Advance.Chivalry]: [Advance.HorsebackRiding, Advance.Feudalism],
  [Advance.CodeOfLaws]: [Advance.Alphabet],
  [Advance.Combustion]: [Advance.Refining, Advance.Explosives],
  [Advance.Communism]: [Advance.Philosophy, Advance.Industrialization],
  [Advance.Computers]: [Advance.Electronics, Advance.Mathematics],
  [Advance.Conscription]: [Advance.Republic, Advance.Explosives],
  [Advance.Construction]: [Advance.Currency, Advance.Masonry],
  [Advance.Corporation]: [Advance.Banking, Advance.Industrialization],
  [Advance.Currency]: [Advance.BronzeWorking],
  [Advance.Democracy]: [Advance.Philosophy, Advance.Literacy],
  [Advance.Electricity]: [Advance.Metallurgy, Advance.Magnetism],
  [Advance.Electronics]: [Advance.Engineering, Advance.Electricity],
  [Advance.Engineering]: [Advance.Wheel, Advance.Construction],
  [Advance.Explosives]: [Advance.Gunpowder, Advance.Chemistry],
  [Advance.Feudalism]: [Advance.Monarchy, Advance.Masonry],
  [Advance.Flight]: [Advance.Combustion, Advance.Physics],
  [Advance.FusionPower]: [Advance.NuclearFission, Advance.Superconductor],
  [Advance.FutureTech]: [Advance.FusionPower],
  [Advance.GeneticEngineering]: [Advance.Corporation, Advance.Medicine],
  [Advance.Gunpowder]: [Advance.IronWorking, Advance.Invention],
  [Advance.HorsebackRiding]: [],
  [Advance.Industrialization]: [Advance.Banking, Advance.RailRoad],
  [Advance.Invention]: [Advance.Engineering, Advance.Literacy],
  [Advance.IronWorking]: [Advance.BronzeWorking],
  [Advance.Irrigation]: [],
  [Advance.LaborUnion]: [Advance.MassProduction, Advance.Communism],
  [Advance.Literacy]: [Advance.CodeOfLaws, Advance.Writing],
  [Advance.Magnetism]: [Advance.Navigation, Advance.Physics],
  [Advance.MapMaking]: [Advance.Alphabet],
  [Advance.Masonry]: [],
  [Advance.MassProduction]: [Advance.Corporation, Advance.Automobile],
  [Advance.Mathematics]: [Advance.Alphabet, Advance.Masonry],
  [Advance.Medicine]: [Advance.Philosophy, Advance.Trade],
  [Advance.Metallurgy]: [Advance.Gunpowder, Advance.University],
  [Advance.Mining]: [],
  [Advance.Monarchy]: [Advance.CodeOfLaws, Advance.CeremonialBurial],
  [Advance.Mysticism]: [Advance.CeremonialBurial],
  [Advance.Navigation]: [Advance.Astronomy, Advance.MapMaking],
  [Advance.NuclearFission]: [Advance.MassProduction, Advance.AtomicTheory],
  [Advance.NuclearPower]: [Advance.Electronics, Advance.NuclearFission],
  [Advance.Philosophy]: [Advance.Mysticism, Advance.Literacy],
  [Advance.Physics]: [Advance.Navigation, Advance.Mathematics],
  [Advance.Plastics]: [Advance.Refining, Advance.SpaceFlight],
  [Advance.Pottery]: [],
  [Advance.RailRoad]: [Advance.BridgeBuilding, Advance.SteamEngine],
  [Advance.Recycling]: [Advance.MassProduction, Advance.Democracy],
  [Advance.Refining]: [Advance.Corporation, Advance.Chemistry],
  [Advance.Religion]: [Advance.Philosophy, Advance.Writing],
  [Advance.Republic]: [Advance.CodeOfLaws, Advance.Literacy],
  [Advance.Roads]: [],
  [Advance.Robotics]: [Advance.Computers, Advance.Plastics],
  [Advance.Rocketry]: [Advance.Electricity, Advance.AdvancedFlight],
  [Advance.SpaceFlight]: [Advance.Computers, Advance.Rocketry],
  [Advance.SteamEngine]: [Advance.Invention, Advance.Physics],
  [Advance.Steel]: [Advance.Metallurgy, Advance.Industrialization],
  [Advance.Superconductor]: [Advance.MassProduction, Advance.Plastics],
  [Advance.TheoryOfGravity]: [Advance.Astronomy, Advance.University],
  [Advance.Trade]: [Advance.CodeOfLaws, Advance.Currency],
  [Advance.University]: [Advance.Philosophy, Advance.Mathematics],
  [Advance.Wheel]: [],
  [Advance.Writing]: [Advance.Alphabet]
}

export default Advance