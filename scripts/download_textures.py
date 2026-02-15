#!/usr/bin/env python3
"""
Script pour télécharger automatiquement les textures GTNH depuis GitHub
"""

import os
import requests
import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent / "textures"

# URLs des textures par mod
TEXTURE_SOURCES = {
    "gregtech": {
        "base_url": "https://raw.githubusercontent.com/GTNewHorizons/GT5-Unofficial/master/src/main/resources/assets/gregtech/textures/blocks/iconsets/",
        "textures": [
            # Multiblocks
            "OVERLAY_FRONT_ELECTRIC_BLAST_FURNACE.png",
            "OVERLAY_FRONT_ELECTRIC_BLAST_FURNACE_ACTIVE.png",
            "OVERLAY_FRONT_VACUUM_FREEZER.png",
            "OVERLAY_FRONT_VACUUM_FREEZER_ACTIVE.png",
            "OVERLAY_FRONT_IMPLOSION_COMPRESSOR.png",
            "OVERLAY_FRONT_MULTI_SMELTER.png",
            "OVERLAY_FRONT_OIL_CRACKER.png",
            "OVERLAY_FRONT_DISTILLATION_TOWER.png",
            "OVERLAY_FRONT_PYROLYSE_OVEN.png",
            "OVERLAY_FRONT_ASSEMBLY_LINE.png",
            "OVERLAY_FRONT_LARGE_CHEMICAL_REACTOR.png",
            "OVERLAY_FRONT_CLEANROOM.png",
            "OVERLAY_FRONT_LARGE_TURBINE.png",
            "OVERLAY_FRONT_LARGE_BOILER.png",
            "OVERLAY_FRONT_HEAT_EXCHANGER.png",
            "OVERLAY_FRONT_PROCESSING_ARRAY.png",
            # Singleblocks
            "OVERLAY_FRONT_MACERATOR.png",
            "OVERLAY_FRONT_MACERATOR_ACTIVE.png",
            "OVERLAY_FRONT_ALLOY_SMELTER.png",
            "OVERLAY_FRONT_ALLOY_SMELTER_ACTIVE.png",
            "OVERLAY_FRONT_ASSEMBLER.png",
            "OVERLAY_FRONT_ASSEMBLER_ACTIVE.png",
            "OVERLAY_FRONT_BENDER.png",
            "OVERLAY_FRONT_COMPRESSOR.png",
            "OVERLAY_FRONT_CENTRIFUGE.png",
            "OVERLAY_FRONT_ELECTROLYZER.png",
            "OVERLAY_FRONT_WIREMILL.png",
            "OVERLAY_FRONT_LATHE.png",
            "OVERLAY_FRONT_CUTTER.png",
            "OVERLAY_FRONT_EXTRUDER.png",
            "OVERLAY_FRONT_MIXER.png",
            "OVERLAY_FRONT_ORE_WASHER.png",
            "OVERLAY_FRONT_SIFTER.png",
            "OVERLAY_FRONT_AUTOCLAVE.png",
            "OVERLAY_FRONT_CHEMICAL_REACTOR.png",
            "OVERLAY_FRONT_DISTILLERY.png",
            "OVERLAY_FRONT_SCANNER.png",
            "OVERLAY_FRONT_REPLICATOR.png",
            "OVERLAY_FRONT_MASS_FABRICATOR.png",
            "OVERLAY_FRONT_ARC_FURNACE.png",
            "OVERLAY_FRONT_PLASMA_ARC_FURNACE.png",
            # Generators
            "OVERLAY_FRONT_DIESEL_GENERATOR.png",
            "OVERLAY_FRONT_GAS_TURBINE.png",
            "OVERLAY_FRONT_STEAM_TURBINE.png",
            "OVERLAY_FRONT_PLASMA_GENERATOR.png",
            # Casings
            "MACHINE_CASING_SOLID_STEEL.png",
            "MACHINE_CASING_ROBUST_TUNGSTENSTEEL.png",
            "MACHINE_CASING_CLEAN_STAINLESSSTEEL.png",
            "MACHINE_CASING_STABLE_TITANIUM.png",
            "MACHINE_CASING_FUSION.png",
            "MACHINE_CASING_FUSION_COIL.png",
            # Hulls
            "MACHINE_LV_SIDE.png",
            "MACHINE_MV_SIDE.png",
            "MACHINE_HV_SIDE.png",
            "MACHINE_EV_SIDE.png",
            "MACHINE_IV_SIDE.png",
            # Hatches
            "OVERLAY_ENERGY_IN.png",
            "OVERLAY_ENERGY_OUT.png",
            "OVERLAY_PIPE_IN.png",
            "OVERLAY_PIPE_OUT.png",
            "OVERLAY_MAINTENANCE.png",
            "OVERLAY_MUFFLER.png",
        ]
    },
    "ae2": {
        "base_url": "https://raw.githubusercontent.com/GTNewHorizons/Applied-Energistics-2-Unofficial/master/src/main/resources/assets/appliedenergistics2/textures/blocks/",
        "textures": [
            "BlockControllerColumnLights.png",
            "BlockControllerLights.png",
            "BlockDrive.png",
            "BlockMolecularAssembler.png",
            "BlockInscriber.png",
            "BlockCraftingStorage.png",
            "BlockInterface.png",
            "BlockCharger.png",
            "BlockEnergyAcceptor.png",
            "BlockEnergyCell.png",
            "BlockDenseEnergyCell.png",
            "BlockChest.png",
            "BlockCondenser.png",
            "BlockGrinder.png",
            "BlockSpatialIOPort.png",
            "BlockQuantumRing.png",
            "BlockQuantumLinkChamber.png",
            "BlockCraftingMonitor.png",
            "BlockCraftingUnit.png",
            "BlockIOPort.png",
        ]
    },
    "enderio": {
        "base_url": "https://raw.githubusercontent.com/GTNewHorizons/EnderIO/master/src/main/resources/assets/enderio/textures/blocks/",
        "textures": [
            "alloySmelterFront.png",
            "alloySmelterFrontOn.png",
            "darkSteelBlock.png",
            "electricalSteelBlock.png",
            "energeticAlloyBlock.png",
            "vibrantAlloyBlock.png",
            "poweredSpawnerFront.png",
            "poweredSpawnerFrontOn.png",
            "killerJoeFront.png",
            "farmFront.png",
            "transceiver.png",
            "reservoirFront.png",
            "tankBlock.png",
        ]
    },
    "botania": {
        "base_url": "https://raw.githubusercontent.com/GTNewHorizons/Botania/master/src/main/resources/assets/botania/textures/blocks/",
        "textures": [
            "pool0.png",
            "pool1.png",
            "pool2.png",
            "pool3.png",
            "spreader0.png",
            "spreader1.png",
            "pylon0.png",
            "alfheimPortal0.png",
            "runeAltar0.png",
            "terraPlate0.png",
            "openCrate0.png",
            "craftCrate0.png",
        ]
    },
    "forestry": {
        "base_url": "https://raw.githubusercontent.com/GTNewHorizons/ForestryMC/master/src/main/resources/assets/forestry/textures/blocks/",
        "textures": [
            "apiary.plain.png",
            "apiary.honey.png",
            "alveary.plain.png",
            "bottler.png",
            "carpenter.png",
            "centrifuge.png",
            "fermenter.png",
            "moistener.png",
            "squeezer.png",
            "still.png",
            "thermionic.png",
            "analyzer.0.png",
            "escritoire.0.png",
        ]
    },
    "thaumcraft": {
        "base_url": "https://raw.githubusercontent.com/GTNewHorizons/Salis-Arcana/master/src/main/resources/assets/thaumcraft/textures/blocks/",
        "textures": [
            "infernalFurnace.png",
            "arcaneWorkbench.png",
            "alembic.png",
            "crucible.png",
            "pedestal.png",
            "researchTable.png",
            "infusionMatrix.png",
            "thaumatorium.png",
            "essentiaReservoir.png",
        ]
    },
    "bloodmagic": {
        "base_url": "https://raw.githubusercontent.com/GTNewHorizons/BloodMagic/master/src/main/resources/assets/alchemicalwizardry/textures/blocks/",
        "textures": [
            "BloodAltar.png",
            "RuneSpeed.png",
            "RuneCapacity.png",
            "RuneSacrifice.png",
            "RuneSelfSacrifice.png",
            "RuneOrb.png",
            "MasterRitualStone.png",
            "RitualStone.png",
            "Teleposer.png",
        ]
    },
    "draconic": {
        "base_url": "https://raw.githubusercontent.com/GTNewHorizons/Draconic-Evolution/master/src/main/resources/assets/draconicevolution/textures/blocks/",
        "textures": [
            "draconiumBlock.png",
            "awakenedDraconiumBlock.png",
            "chaosFragment.png",
            "energyCore.png",
            "energyPylon.png",
            "fusionCraftingCore.png",
            "reactorCore.png",
            "teleporterStand.png",
        ]
    }
}

def download_texture(url, output_path):
    """Télécharge une texture depuis une URL"""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200 and len(response.content) > 100:
            with open(output_path, 'wb') as f:
                f.write(response.content)
            return True
        return False
    except Exception as e:
        print(f"Erreur: {e}")
        return False

def main():
    stats = {"success": 0, "failed": 0}

    for mod, data in TEXTURE_SOURCES.items():
        print(f"\n=== Téléchargement {mod.upper()} ===")
        mod_dir = BASE_DIR / mod
        mod_dir.mkdir(parents=True, exist_ok=True)

        for texture in data["textures"]:
            url = data["base_url"] + texture
            output = mod_dir / texture

            if output.exists():
                print(f"  [SKIP] {texture}")
                continue

            if download_texture(url, output):
                print(f"  [OK] {texture}")
                stats["success"] += 1
            else:
                print(f"  [FAIL] {texture}")
                stats["failed"] += 1

    print(f"\n=== Résumé ===")
    print(f"Téléchargés: {stats['success']}")
    print(f"Échoués: {stats['failed']}")

if __name__ == "__main__":
    main()
