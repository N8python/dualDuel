const items = {
    armor: {
        bronze: {
            title: "Bronze Armor",
            image: "bronze.png",
            description: "This light armor provides minimal protection and crumples under the power of high damage attacks.",
            stats: {
                damageReduction: 0.3,
                damageReduction2: 0.02,
                multiplier() {
                    return 1;
                },
                speedDebuff: 0
            }
        },
        chain: {
            title: "Chain Armor",
            image: "chain.png",
            description: "This armor provides slightly better protection than bronze. However, it often fails to stop ranged projectiles.",
            stats: {
                damageReduction: 0.4,
                damageReduction2: 0.015,
                multiplier(type) {
                    if (type === "ranged") {
                        if (Math.random() < 0.5) {
                            return 0;
                        }
                    }
                    return 1;
                },
                speedDebuff: 0
            }
        },
        steel: {
            title: "Steel Armor",
            image: "steel.png",
            description: "This armor protects against the brunt of most attacks, though it slows the wearer down.",
            stats: {
                damageReduction: 0.6,
                damageReduction2: 0.0125,
                multiplier() {
                    return 1;
                },
                speedDebuff: 0.25
            }
        },
        spiked: {
            title: "Spiked Armor",
            image: "spiked.png",
            description: "Provides the protection of steel while dealing damage to attacking opponents. Slows the wearer down.",
            stats: {
                damageReduction: 0.6,
                damageReduction2: 0.0125,
                multiplier() {
                    return 1;
                },
                spikes() {
                    return 2 + Math.random() * 2;
                },
                speedDebuff: 0.25
            }
        },
        studded: {
            title: "Studded Armor",
            image: "studded.png",
            description: "Offers decent protection, though it slows the wearer down and makes it harder to manuever. Has a 50% to offer very powerful protection against an attack.",
            stats: {
                damageReduction: 0.75,
                damageReduction2: 0.01,
                multiplier() {
                    if (Math.random() < 0.5) {
                        return 0.533;
                    }
                    return 1;
                },
                speedDebuff: 0.15,
                sensitivityDebuff: 0.5
            }
        },
        plate: {
            title: "Plate Armor",
            image: "plate.png",
            description: "Offers some protection against attacks. Does not buckle under high damage and will occasionally neutralize a hit almost entirely.",
            stats: {
                damageReduction: 0.55,
                damageReduction2: 0.005,
                multiplier(type) {
                    if (type === "melee") {
                        if (Math.random() < 0.25) {
                            return 1.45;
                        }
                        if (Math.random() < 0.25) {
                            return 0;
                        }
                    }
                    return 1;
                },
                speedDebuff: 0
            }
        }
    },
    hats: {
        scoutsCap: {
            title: "Scout's Cap",
            image: "scoutsCap.png",
            description: "Buffs speed and allows you to reload bow faster. Makes you more alert."
        },
        knightsHelmet: {
            title: "Knights Helmet",
            image: "knightsHelmet.png",
            description: "Has a 25% chance to completely block a hit, but makes the player weak to ranged projectiles."
        },
        featheredCap: {
            title: "Feathered Cap",
            image: "featheredCap.png",
            description: "Buffs speed significantly and increases jump height, at the cost of reducing your health by 25%."
        },
        umbrella: {
            title: "Umbrella",
            image: "umbrella.png",
            description: "Reduces wearer's weight, increasing jump height and reducing effect of gravity on wearer. Reduces health significantly."
        }
    },
    items: {
        sword: {
            title: "Sword",
            image: "sword.png",
            description: "Standard weapon. Hits and slashes. Blocks on right click. Moderate damage."
        },
        axe: {
            title: "Axe",
            image: "axe.png",
            description: "Hits and blocks like the sword does, while doing slightly more damage. Can perform a powerful AOE attack on enemies."
        },
        bow: {
            title: "Bow",
            image: "bow.png",
            description: "Can shoot and fire arrows. As its special attack, fires a supercharged, high-damage, high-velocity shot. Also can perform a melee attack if necessary."
        }
        /*,
                boomerang: {
                    title: "Boomerang",
                    image: "boomerang.png",
                    description: "Can be thrown in a straight line or arc. Always returns to thrower. Can block attacks as well."
                }*/
    }
}