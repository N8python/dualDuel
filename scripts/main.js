let player;
let canJump = true;
let targetXRot = 0;
let currXRot = 0;
let currYRot = Math.PI / 8;
let currZRot = 0;
let targetZRot = 0;
let targetYRot = Math.PI / 8;
let currXOffset = 0.6;
let targetXOffset = 0.6;
let currYOffset = 0.35;
let targetYOffset = 0.35;
let zDepth = 0;
let targetZDepth = 0;
let cooldown = 0;
let targetCooldown = 0;
let jumpCooldown = 0;
let blocking = false;
let slashing = false;
let framesSinceDeath = 0;
let sensitivity;
let objects = [];
let projectiles = [];
let bootFunction;
let resetFunction;
let mainScene;
let levelAIs = {
    1: MeleeEnemyAI,
    2: RangedEnemyAI,
    3: KnightEnemyAI,
    4: PistolEnemyAI,
    5: BomberEnemyAI,
    6: JetpackEnemyAI,
    7: WizardEnemyAI,
    8: LeaperEnemyAI,
    9: MissileEnemyAI,
    10: BossEnemyAI
}
let weaponClasses = {
    "sword": Sword,
    "axe": Axe,
    "bow": Bow,
    "crossbow": Crossbow,
    "boomerang": Boomerang,
    "claw": Claw
}
let levelCoinYield = {
    1: [50, 25, 10],
    2: [75, 50, 20, 10],
    3: [100, 50, 25, 15],
    4: [125, 75, 30, 15],
    5: [200, 100, 50, 25],
    6: [200, 150, 100, 50, 25],
    7: [225, 150, 100, 50, 30],
    8: [250, 175, 125, 75, 50],
    9: [250, 175, 125, 75],
    10: [500, 250, 125, 100]
}
let currLevel;
const healthBars = document.getElementById("healthBars").getContext("2d");
const loading = document.getElementById("loading");
const gameOverMessage = document.getElementById("gameOverMessage");
const resetButton = document.getElementById("resetButton");
const menu = document.getElementById("menu");
if (!localProxy.playerArmor) {
    localProxy.playerArmor = "none";
}
if (!localProxy.playerHat) {
    localProxy.playerHat = "none";
}
if (!localProxy.playerItem) {
    localProxy.playerItem = "sword";
}
if (!localProxy.unlockedStuff) {
    localProxy.unlockedStuff = ["sword"];
}
if (localProxy.coins === undefined) {
    localProxy.coins = 0;
}
if (!localProxy.levelWins) {
    localProxy.levelWins = {};
}
if (!localProxy.maxLevelUnlocked) {
    localProxy.maxLevelUnlocked = 1;
}
const hardReset = () => {
    localProxy.playerArmor = "none";
    localProxy.playerHat = "none";
    localProxy.playerItem = "sword";
    localProxy.unlockedStuff = ["sword"];
    localProxy.coins = 0;
    localProxy.levelWins = {};
    localProxy.maxLevelUnlocked = 1;
    location.reload();
}

function angleDifference(angle1, angle2) {
    const diff = ((angle2 - angle1 + Math.PI) % (Math.PI * 2)) - Math.PI;
    return (diff < -Math.PI) ? diff + (Math.PI * 2) : diff;
}

function futurePlayerPos(seconds, transform = true) {
    if (transform) {
        player.body.transform();
    }
    return {
        x: player.position.x + player.body.velocity.x * seconds,
        y: player.position.y + player.body.velocity.y * seconds,
        z: player.position.z + player.body.velocity.z * seconds
    }
}

function dealExplodeDamage(position, damage, decayRate, strength = 6, fromPlayer, damagePlayer = true) {
    if (damagePlayer) {
        playerTakeDamage(damage / (decayRate ** player.position.distanceTo(position)), "explosion");
        player.body.setVelocity(player.body.velocity.x + Math.max(4 - player.position.distanceTo(position), 0) * Math.atan2(player.position.x - position.x, player.position.z - position.z), player.body.velocity.y + Math.max(4 - player.position.distanceTo(position), 0), player.body.velocity.z + Math.max(4 - player.position.distanceTo(position), 0) * Math.atan2(player.position.x - position.x, player.position.z - position.z));
    }
    if (!(mainScene.enemy.isBomber || mainScene.enemy.isWizard || mainScene.enemy.isBoss) || fromPlayer) {
        mainScene.enemy.health -= damage / (decayRate ** mainScene.enemy.position.distanceTo(position));
        mainScene.enemy.health = Math.max(mainScene.enemy.health, 0);
        const enemy = mainScene.enemy;
        mainScene.enemy.body.setVelocity(enemy.body.velocity.x + (Math.max((strength - 2) - enemy.position.distanceTo(position), 0) / (enemy.isBoss ? 3 : 1)) * Math.atan2(enemy.position.x - position.x, enemy.position.z - position.z), enemy.body.velocity.y + Math.max(strength * 0.25 - enemy.position.distanceTo(position), 0), enemy.body.velocity.z + (Math.max((strength - 2) - enemy.position.distanceTo(position), 0) / (enemy.isBoss ? 3 : 1)) * Math.atan2(enemy.position.x - position.x, enemy.position.z - position.z));
    }
}

function playerTakeDamage(damage, type) {
    if (localProxy.playerHat === "knightsHelmet") {
        if (Math.random() < 0.25) {
            damage = 0;
        }
        if (type === "ranged" && Math.random() < 0.25) {
            damage *= 2;
        }
    }
    let reduction;
    if (localProxy.playerArmor !== "none") {
        reduction = (items.armor[localProxy.playerArmor].stats.damageReduction * items.armor[localProxy.playerArmor].stats.multiplier(type)) - (items.armor[localProxy.playerArmor].stats.damageReduction2 * damage);
    } else {
        reduction = 0;
    }
    player.health -= damage * (1 - reduction);
    if (items.armor[localProxy.playerArmor] && items.armor[localProxy.playerArmor].stats.spikes && type === "melee" && player.fire < 0) {
        mainScene.enemy.health -= items.armor[localProxy.playerArmor].stats.spikes();
    }
}
class MainScene extends Scene3D {
    constructor() {
        super({ key: 'MainScene' })
        this.bob = { x: 0, y: 0, z: 0 };
    }
    static loadInstance(instance) {
        instance.initiated = true;
        instance.hidden = false;
        instance.accessThirdDimension({ maxSubSteps: 10, fixedTimeStep: 1 / 180 });
        instance.third.warpSpeed('-orbitControls').then(({ ground }) => {
            instance.third.load.texture('metal').then(texture => {
                texture.wrapS = THREE.MirroredRepeatWrapping;
                texture.wrapT = THREE.MirroredRepeatWrapping;
                texture.repeat.set(8, 8);
                ground.material = new THREE.MeshPhongMaterial({ map: texture, opacity: 0.5, transparent: true })
            })
        })
        instance.third.load.preload("melee-enemy", './assets/enemies/meleeEnemy/model.fbx');
        instance.third.load.preload("melee-sword", './assets/models/sg-sword.fbx');
        instance.third.load.preload("ranged-enemy", './assets/enemies/rangedEnemy/model.fbx');
        instance.third.load.preload("ranged-bow", './assets/models/sg-bow.fbx');
        instance.third.load.preload("arrow", "./assets/models/arrow.fbx");
        instance.third.load.preload("quiver", "./assets/models/sg-quiver.fbx");
        instance.third.load.preload("knight-enemy", './assets/enemies/knightEnemy/model.fbx');
        instance.third.load.preload("knight-sword", './assets/models/knight-sword.fbx');
        instance.third.load.preload("pistol-enemy", './assets/enemies/pistolEnemy/model.fbx');
        instance.third.load.preload("pistol-pistol", './assets/models/pistol.fbx');
        instance.third.load.preload("pistol-knife", './assets/models/knife.fbx');
        instance.third.load.preload("bomber-enemy", './assets/enemies/bomberEnemy/model.fbx');
        instance.third.load.preload("bomber-firelance", './assets/models/fire-lance.fbx');
        instance.third.load.preload("bomber-dynamite", './assets/models/dynamite.fbx');
        instance.third.load.preload("bomber-bomb", './assets/models/bomb.fbx');
        instance.third.load.preload("jetpack-enemy", './assets/enemies/jetpackEnemy/model.fbx');
        instance.third.load.preload("jetpack-jetpack", './assets/models/jetpack.fbx');
        instance.third.load.preload("jetpack-rifle", './assets/models/rifle.fbx');
        instance.third.load.preload("wizard-enemy", './assets/enemies/wizardEnemy/model.fbx');
        instance.third.load.preload("wizard-hat", './assets/models/witch-hat.fbx');
        instance.third.load.preload("leaper-enemy", './assets/enemies/leaperEnemy/model.fbx');
        instance.third.load.preload("leaper-hammer", './assets/models/hammer.fbx');
        instance.third.load.preload("missile-enemy", './assets/enemies/missileEnemy/model.fbx');
        instance.third.load.preload("missile", './assets/models/missile.fbx');
        instance.third.load.preload("missile-launcher", './assets/models/missile-launcher.fbx');
        instance.third.load.preload("missile-rifle", './assets/models/thicc-rifle.fbx');
        instance.third.load.preload("boss-enemy", './assets/enemies/bossEnemy/model.fbx');
        instance.third.load.preload("boss-bolt", './assets/models/lightning.fbx');
        instance.third.load.preload("lead-bullet", './assets/models/lead-bullet.fbx');
        instance.third.load.preload("bullet", "./assets/models/bullet.fbx");
        instance.third.load.preload("laser", "./assets/models/laser.fbx")
        instance.third.load.preload("shield", './assets/models/shield.fbx');
        //instance.third.load.preload("pot", "./assets/models/pot.fbx");
        instance.third.load.preload('metal', './assets/images/ice.png');
        instance.third.load.preload('cobblestone', './assets/images/cobblestone.jpg');
        instance.third.load.preload('sword', './assets/weapons/sword.fbx');
        instance.third.load.preload('axe', './assets/weapons/axe.fbx');
        instance.third.load.preload('bow', './assets/weapons/bow.fbx');
        instance.third.load.preload('crossbow', './assets/weapons/crossbow.fbx');
        instance.third.load.preload('boomerang', './assets/weapons/boomerang.fbx');
        instance.third.load.preload('claw', './assets/weapons/claw.fbx');
        (async() => {
            const particles = ["smoke", "dynamite", "explosion", "jetpack", "ice", "fire", "air", "shield", "boom", "shockwave"];
            for (const particle of particles) {
                const text = await fetch(`./assets/particles/${particle}.json`);
                const json = await text.json();
                Nebula.System.fromJSONAsync(json, THREE, { shouldAutoEmit: false }).then(system => {
                    const renderer = new Nebula.SpriteRenderer(instance.third.scene, THREE);
                    const particles = system.addRenderer(renderer);
                    mainScene[particle] = particles;
                    particles.emit({
                        onStart: () => {},
                        onUpdate: () => {},
                        onEnd: () => {},
                    });
                    // particles.emitters[0].currentEmitTime = 1000;
                    particles.emitters.forEach(emitter => {
                        emitter.currentEmitTime = 1000;
                    });
                    setInterval(() => {
                        particles.update();
                        //console.log(system.emitters[0].particles.length);
                    }, 33);
                    /*setInterval(() => {
                        mainScene.explosion.emitters[0].position.x = Math.random() * 10 - 5;
                        mainScene.explosion.emitters[0].position.z = Math.random() * 10 - 5;
                        mainScene.explosion.emitters[0].currentEmitTime = 0;
                    }, 2500)*/
                });
            }
        })();
        //this.third.haveSomeFun(50);
        for (let i = 0; i < 0; i++) {
            objects.push(instance.third.physics.add.box({
                x: 3.5,
                y: Math.random() * 5,
                z: 3.5,
                width: Math.random(),
                height: Math.random(),
                depth: Math.random()
            }, { phong: { color: 0xffffff * Math.random() } }));
        }
        instance.third.renderer.gammaFactor = 1.5;
        instance.third.load.texture("cobblestone").then(texture => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 2);
            const walls = [];
            walls.push(instance.third.physics.add.box({ height: 2.5, z: 10, y: 1.25, width: 21, depth: 1 }, { phong: { map: texture, color: 0x999999 } }));
            walls.push(instance.third.physics.add.box({ height: 2.5, z: -10, y: 1.25, width: 21, depth: 1 }, { phong: { map: texture, color: 0x999999 } }));
            walls.push(instance.third.physics.add.box({ height: 2.5, x: 10, y: 1.25, width: 1, depth: 21 }, { phong: { map: texture, color: 0x999999 } }));
            walls.push(instance.third.physics.add.box({ height: 2.5, x: -10, y: 1.25, width: 1, depth: 21 }, { phong: { map: texture, color: 0x999999 } }));

            walls.forEach(wall => {
                wall.body.setCollisionFlags(2);
            });
            instance.walls = walls;
        });
        // add red dot
        // add player
        instance.player = instance.third.physics.add.sphere({ z: -5 });
        instance.player.health = 100;
        instance.player.maxHealth = 100;
        instance.player.ice = 0;
        instance.player.fire = 0;
        if (localProxy.playerHat === "featheredCap") {
            instance.player.health *= 0.75;
            instance.player.maxHealth *= 0.75;
        }
        if (localProxy.playerHat === "umbrella") {
            instance.player.health *= 0.65;
            instance.player.maxHealth *= 0.65;
            instance.player.body.setGravity(0, -9.81 * 0.5, 0)
        }
        player = instance.player;
        /* this.player.body.on.collision((otherObject, event) => {
             if ((otherObject.name === "ground") && event === "collision") {
                 canJump = true;
             }
         });*/
        instance.player.body.setFriction(1);
        loading.innerHTML = "Loading Weapon...";
        /*instance.third.load.fbx("./assets/weapons/sword.fbx").then(object => {
            object.receiveShadow = true;
            object.castShadow = true;
            loading.innerHTML = "Loading Enemy...";
            instance.sword = object;
            instance.sword.scale.set(0.0015, 0.0015, 0.0015);
            instance.sword.rotation.z = (-3 * (Math.PI / 2)) + Math.PI;
            instance.sword.rotation.x = Math.PI / 2;
            instance.sword.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = child.receiveShadow = true
                    if (child.material) child.material.metalness = 0
                }
            })
            instance.third.add.existing(instance.sword);
            levelAIs[currLevel].loadEnemy(instance);
        });*/
        /*instance.third.load.fbx("pot").then(object => {
            object.scale.set(0.01, 0.01, 0.01)
            object.position.set(0, 1, 0);
            instance.third.add.existing(object);
            instance.third.physics.add.existing(object, { shape: 'hull', color: 'red' });
        });*/
        weaponClasses[localProxy.playerItem].loadWeapon(instance);

        // add first person controls
        instance.firstPersonControls = new FirstPersonControls(instance.third.camera, instance.player, {})

        // lock the pointer and update the first person control
        instance.input.on('pointerdown', () => {
            if (instance.player && instance.player.health === 0) {
                return;
            }
            if (instance.hidden) {
                return;
            }
            if (instance.input.mousePointer.rightButtonDown()) {
                instance.weaponController.secondaryAttack();
            } else if (instance.keys.Alt.isDown) {
                instance.weaponController.specialAttack();
            } else {
                instance.weaponController.primaryAttack();
            }
            instance.input.mouse.requestPointerLock()
        })
        instance.input.on('pointermove', pointer => {
            if (instance.input.mouse.locked && instance.player && instance.player.health > 0) {
                let multiplier = 1;
                if (items.armor[localProxy.playerArmor] && items.armor[localProxy.playerArmor].stats.sensitivityDebuff) {
                    multiplier -= items.armor[localProxy.playerArmor].stats.sensitivityDebuff;
                }
                if (localProxy.playerHat === "scoutsCap") {
                    multiplier += 0.25;
                }
                instance.firstPersonControls.update(pointer.movementX * 0.5 * sensitivity * multiplier, pointer.movementY * sensitivity * 0.5 * multiplier);
            }
        })
        instance.events.on('update', () => {
            instance.firstPersonControls.update(0, 0)
        })

        // add keys
        instance.keys = {
            w: instance.input.keyboard.addKey('w'),
            a: instance.input.keyboard.addKey('a'),
            s: instance.input.keyboard.addKey('s'),
            d: instance.input.keyboard.addKey('d'),
            Alt: instance.input.keyboard.addKey('Alt')
        }
    }
    handleSwing() {
        objects.forEach(object => {
            const theta = Math.atan2(object.position.x - this.player.position.x, object.position.z - this.player.position.z);
            const dist = Math.hypot(object.position.x - this.player.position.x, object.position.z - this.player.position.z);
            const direction = new THREE.Vector3();
            const rotation = this.third.camera.getWorldDirection(direction)
            const cTheta = Math.atan2(rotation.x, rotation.z);
            const angleDiff = cTheta - theta;
            if (angleDiff < (slashing ? Math.PI / 4 : Math.PI / 6) && angleDiff > (slashing ? -Math.PI / 4 : 0) && dist < 3.5 && Math.abs(object.position.y - player.position.y) < 2 && !object.dead) {
                let blocked = false;
                if (object.aggroState && (object.strafeCounter !== undefined || object.runTick !== undefined)) {
                    if (slashing) {
                        if (Math.random() < 1) {
                            object.animation.play("Block");
                            blocked = true;
                        }
                    } else {
                        if (Math.random() < 1) {
                            object.animation.play("Block");
                            blocked = true;
                        }
                    }
                    if (blocked === true) {
                        setTimeout(() => {
                            targetXRot = 0.5;
                        }, 0);
                    }
                    if (Math.random() < 0.25 && !blocked) {
                        object.aggroState = "flee";
                    }
                    if (object.health < 30 && !blocked) {
                        if (Math.random() < 0.25) {
                            object.aggroState = "flee";
                        }
                    }
                }
                if (!blocked) {
                    object.body.setVelocity(object.body.velocity.x + 3 * (1 + +slashing) * Math.sin(theta), object.body.velocity.y + 2.5, object.body.velocity.z + 3 * (1 + +slashing) * Math.cos(theta));
                }
                if (object.health && !blocked) {
                    object.health -= Math.floor(Math.random() * 5 + 3 + 3 * +slashing);
                    object.health = Math.max(0, object.health);
                }
            }
            // const cameraTheta = Math.atan2(this.third.camera.rotation.x, this.third.camera.rotation.z);
            /*if (Math.abs(this.third.camera.position.angleTo(object.position)) < Math.PI / 4) {
                object.body.setVelocity(3 * Math.sin(theta), 2, 3 * Math.cos(theta));
            }*/
        });
    }
    create() {
        mainScene = this;
        const self = this;
        bootFunction = () => {
            MainScene.loadInstance(self);
        };
    }
    reset() {
        framesSinceDeath = 0;
        document.getElementById("gameOverMessage").innerHTML = "";
        /*this.enemy.visible = false;
        this.enemyAI = undefined;
        this.third.physics.destroy(this.enemy);
        objects.splice(objects.indexOf(this.enemy), 1);*/
        this.player.body.setCollisionFlags(2);
        this.player.health = this.player.maxHealth;
        this.player.ice = 0;
        this.player.fire = 0;
        // set the new position
        this.player.position.set(0, 0, -5);
        this.player.body.needUpdate = true;
        //this.player.rotateZ(Math.PI / 2);
        this.player.body.once.update(() => {
            this.player.body.setCollisionFlags(0);
            // if you do not reset the velocity and angularVelocity, the object will keep it
            this.player.body.setVelocity(0, 0, 0);
            this.player.body.setAngularVelocity(0, 0, 0);
        });
        this.sword.visible = false;
        this.third.scene.children.splice(this.third.scene.children.indexOf(this.sword), 1);
        weaponClasses[localProxy.playerItem].loadWeapon(this);
        //levelAIs[currLevel].loadEnemy(this);
        // this.initiated = false;
        //this.scene.restart();
        //bootFunction();
    }
    removeEnemy() {
        this.enemy.visible = false;
        this.enemyAI = undefined;
        this.third.physics.destroy(this.enemy);
        this.third.scene.children.splice(this.third.scene.children.indexOf(this.enemy), 1);
        objects.splice(objects.indexOf(this.enemy), 1);
        for (let i = 0; i < 10; i++) {
            projectiles.forEach(projectile => {
                projectile.body.visible = false;
                this.third.physics.destroy(projectile.body);
                this.third.scene.children.splice(this.third.scene.children.indexOf(projectile.body), 1);
                objects.splice(objects.indexOf(projectile.body), 1);
                projectiles.splice(projectiles.indexOf(projectile), 1);
            });
        }
    }
    hide() {
        this.third.scene.children.forEach(child => {
            child.visible = false;
        });
        this.hidden = true;
    }
    show() {
        this.third.scene.children.forEach(child => {
            child.visible = true;
        });
        this.hidden = false;
    }
    update(time, delta) {
        if (!this.initiated || this.hidden || !this.enemy) {
            healthBars.clearRect(0, 0, 300, 300);
            return;
        }
        this.player.ice--;
        this.player.fire--;
        jumpCooldown -= 1;
        if (this.player.position.y < -10 && gameOverMessage.innerHTML === "") {
            resetButton.style.display = "block";
            gameOverMessage.innerHTML = "You Died!"
            this.player.health = 0;
        }
        if (this.enemy.position.y < -10 && gameOverMessage.innerHTML === "") {
            resetButton.style.display = "block";
            gameOverMessage.innerHTML = "You Won!";
            playerWin();
            this.enemy.dead = true;
        }
        this.player.health = Math.max(this.player.health, 0);
        if (this.player.health === 0) {
            if (framesSinceDeath === 0) {
                resetButton.style.display = "block";
                gameOverMessage.innerHTML = "You Died!"
            }
            framesSinceDeath++;
        }
        healthBars.fillStyle = "black";
        healthBars.fillRect(76, 1, 158, 28);
        healthBars.fillStyle = `rgb(${255 * (1 - (player.health / player.maxHealth))}, ${255 * (player.health / player.maxHealth)}, 0)`;
        if (player.ice > 0) {
            healthBars.fillStyle = "cyan";
        }
        if (player.fire > 0) {
            healthBars.fillStyle = "orange";
        }
        healthBars.fillRect(80, 5, 150 * (player.health / player.maxHealth), 20);
        healthBars.fillStyle = "black";
        healthBars.fillRect(76, 36, 158, 28);
        healthBars.fillStyle = `rgb(${255 * (1 - (this.enemy.health / this.enemy.maxHealth))}, ${255 * (this.enemy.health / this.enemy.maxHealth)}, 0)`;
        healthBars.fillRect(80, 40, 150 * (this.enemy.health / this.enemy.maxHealth), 20);
        healthBars.font = "30px monospace";
        healthBars.fillStyle = "black";
        healthBars.fillText("You: ", 0, 25);
        healthBars.font = "20px monospace";
        healthBars.fillStyle = "black";
        healthBars.fillText("Enemy: ", 0, 55);
        if (loading.innerHTML !== "") {
            return;
        }
        this.player.body.transform();
        if (this.enemyAI) {
            this.enemyAI.update(player, this.third.scene.children.find(x => x.name === "ground"));
        }
        projectiles.forEach(projectile => {
            projectile.update();
        })
        const block = this.input.mousePointer.rightButtonDown();
        if (!block) {
            blocking = false;
            if (localProxy.playerItem !== "crossbow") {
                this.weaponController.charge = 0;
            }
        }
        this.weaponController.update();
        if (this.keys.w.isDown && this.player.health > 0) {
            this.bob.x = Math.sin(time * -0.009) * 0.0075;
            this.bob.y = Math.sin(time * 0.009) * 0.0075;
            this.bob.z = Math.sin(time * 0.009) * 0.0075;
        } else {
            this.bob.x = Math.sin(time * -0.003) * 0.0075;
            this.bob.y = Math.sin(time * 0.003) * 0.0075;
            this.bob.z = Math.sin(time * 0.003) * 0.0075;
        }
        this.third.camera.position.y += this.bob.y * 1.75;
        this.third.camera.position.y -= 0;
        if (this.player.health === 0) {
            this.third.camera.rotateZ(Math.PI / 2 * Math.min(framesSinceDeath / 60, 1));
        }
        if (this.sword) {
            this.weaponController.placeWeapon(this);
        }
        if (this.third.scene.children.find(x => x.name === "ground")) {
            /*const groundRaycaster = new THREE.Raycaster();
            groundRaycaster.set(
                this.player.position.clone().add(new THREE.Vector3(0, 0, 0)),
                new THREE.Vector3(0, 0, 0));
            const intersects = groundRaycaster.intersectObject(this.third.scene.children.find(x => x.name === "ground"));
            console.log(intersects);*/
            const ground = this.third.scene.children.find(x => x.name === "ground");
            ground.geometry.computeBoundingBox();
            [ground.geometry.boundingBox.min.y, ground.geometry.boundingBox.min.z] = [ground.geometry.boundingBox.min.z, ground.geometry.boundingBox.min.y];
            [ground.geometry.boundingBox.max.y, ground.geometry.boundingBox.max.z] = [ground.geometry.boundingBox.max.z, ground.geometry.boundingBox.max.y];
            if (ground.geometry.boundingBox.containsPoint({
                    x: player.position.x,
                    y: player.position.y - 1.025,
                    x: player.position.z
                })) {
                canJump = true;
            }
            /*this.walls.forEach(wall => {
                wall.geometry.computeBoundingBox();
                //[wall.geometry.boundingBox.min.y, wall.geometry.boundingBox.min.z] = [wall.geometry.boundingBox.min.z, wall.geometry.boundingBox.min.y];
                //[wall.geometry.boundingBox.max.y, wall.geometry.boundingBox.max.z] = [wall.geometry.boundingBox.max.z, wall.geometry.boundingBox.max.y];
                //console.log(wall.geometry.boundingBox);
                if (wall.geometry.boundingBox.containsPoint({
                        x: player.position.x,
                        y: player.position.y - 1.025,
                        x: player.position.z
                    })) {
                    console.log("YAY")
                    canJump = true;
                }
            })*/
            if (jumpCooldown > 0) {
                canJump = false;
            }
        }
        const oldVelocity = this.player.body.velocity;
        const velocityUpdate = [oldVelocity.x, oldVelocity.y, oldVelocity.z];
        const direction = new THREE.Vector3();
        const rotation = this.third.camera.getWorldDirection(direction);
        const theta = Math.atan2(rotation.x, rotation.z);
        let speed = blocking ? 0.06 : 0.25;
        if (player.health === 0) {
            speed = 0;
        }
        if (localProxy.playerArmor !== "none") {
            speed *= (1 - items.armor[localProxy.playerArmor].stats.speedDebuff);
        }
        if (localProxy.playerHat === "scoutsCap") {
            speed *= 1.25;
        }
        if (localProxy.playerHat === "featheredCap") {
            speed *= 1.5;
        }
        if (this.weaponController.charge > 0) {
            speed *= 0.25;
        }
        if (player.ice > 0) {
            speed *= 0.33;
        }
        if (player.fire > 0 && player.health > 0) {
            playerTakeDamage(0.25, "melee")
        }
        if (this.keys.w.isDown) {
            velocityUpdate[0] += Math.sin(theta) * speed;
            velocityUpdate[2] += Math.cos(theta) * speed;
        } else if (this.keys.s.isDown) {
            velocityUpdate[0] -= Math.sin(theta) * speed;
            velocityUpdate[2] -= Math.cos(theta) * speed;
        }
        if (this.keys.a.isDown) {
            velocityUpdate[0] += Math.sin(theta + Math.PI / 2) * speed;
            velocityUpdate[2] += Math.cos(theta + Math.PI / 2) * speed;
        } else if (this.keys.d.isDown) {
            velocityUpdate[0] += Math.sin(theta - Math.PI / 2) * speed;
            velocityUpdate[2] += Math.cos(theta - Math.PI / 2) * speed;
        }
        velocityUpdate[0] *= 0.975;
        velocityUpdate[2] *= 0.975;
        this.player.body.setVelocity(...velocityUpdate);
    }
}
document.onkeydown = (e) => {
    if (e.key === " " && player && canJump && player.health > 0 && loading.innerHTML === "") {
        const oldVelocity = player.body.velocity;
        const velocityUpdate = [oldVelocity.x, oldVelocity.y, oldVelocity.z];
        velocityUpdate[1] += 5;
        if (localProxy.playerHat === "featheredCap" || localProxy.playerHat === "umbrella") {
            velocityUpdate[1] *= 1.25;
        }
        player.body.setVelocity(...velocityUpdate);
        jumpCooldown = 15;
        canJump = false;
    }
}

const config = {
    type: Phaser.WEBGL,
    transparent: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
    },
    scene: [MainScene],
    ...Canvas({ antialias: true })
}

window.addEventListener('load', () => {
    enable3d(() => new Phaser.Game(config)).withPhysics('./lib')
});
/*document.getElementById("startGame").addEventListener("click", () => {
    sensitivity = 1;
    document.getElementById("menu").innerHTML = "";
    loading.innerHTML = "Loading...";
    bootFunction();
});*/
const levelSelect = () => {
    menu.innerHTML = `<img style="position: absolute;left:50%;top:7.5%;transform:translate(-50%, -50%);z-index:5;" src="assets/images/levelselect.png">`;
    for (let i = 1; i <= 10; i++) {
        const button = document.createElement("button");
        button.classList.add("btn");
        button.innerHTML = i;
        button.style.zIndex = 5;
        button.style.position = "absolute";
        if (i < 6) {
            button.style.top = `calc(25%)`;
            button.style.left = `calc(50% + ${100 * i}px - 300px)`;
        } else {
            button.style.top = `calc(25% + 100px)`;
            button.style.left = `calc(50% + ${100 * (i - 5)}px - 300px)`;
        }
        button.style.width = "75px";
        button.style.transform = "translate(-50%, -50%)";
        if (i > localProxy.maxLevelUnlocked) {
            button.setAttribute("disabled", "disabled");
        }
        button.onclick = () => {
            sensitivity = 1;
            currLevel = i;
            document.getElementById("menu").innerHTML = "";
            loading.innerHTML = "Loading...";
            if (mainScene.hidden) {
                mainScene.reset();
                mainScene.show();
            } else {
                bootFunction();
            }
        }
        menu.appendChild(button);
    }
    const backButton = document.createElement("button");
    backButton.classList.add("btn");
    backButton.zIndex = 5;
    backButton.style.position = "absolute";
    backButton.style.left = "50%";
    backButton.style.top = "60%";
    backButton.style.transform = "translate(-50%, -50%)";
    backButton.innerHTML = "Back";
    backButton.style.zIndex = 5;
    backButton.onclick = () => {
        mainMenu();
    }
    menu.appendChild(backButton);
}
const shop = () => {
    menu.innerHTML = `<img style="position: absolute;left:50%;top:7.5%;transform:translate(-50%, -50%);z-index:5;" src="assets/images/shop.png">`;
    const armorDisplay = document.createElement("div");
    armorDisplay.style.width = "186px";
    armorDisplay.style.height = "400px";
    armorDisplay.style.position = "absolute";
    armorDisplay.style.zIndex = 5;
    armorDisplay.style.border = "4px solid black";
    armorDisplay.style.top = "45%";
    armorDisplay.style.left = "25%";
    armorDisplay.style.transform = "translate(-50%, -50%)";
    armorDisplay.innerHTML = `<h1 style="margin-left:8px;margin-top:0px;margin-bottom:0px;">Armor:</h1>`;
    const armorImage = document.createElement("img");
    armorImage.style.width = "186px";
    armorImage.style.height = "350px";
    if (localProxy.playerArmor !== "none") {
        armorImage.src = `assets/images/items/armor/${items.armor[localProxy.playerArmor].image}`;
    }
    armorDisplay.appendChild(armorImage);
    const hatDisplay = document.createElement("div");
    hatDisplay.style.width = "186px";
    hatDisplay.style.height = "200px";
    hatDisplay.style.position = "absolute";
    hatDisplay.style.zIndex = 5;
    hatDisplay.style.border = "4px solid black";
    hatDisplay.style.top = "calc(45% - 100px)";
    hatDisplay.style.left = "calc(25% + 190px)";
    hatDisplay.style.transform = "translate(-50%, -50%)";
    hatDisplay.innerHTML = `<h1 style="margin-left:8px;margin-top:0px;margin-bottom:0px;">Hat:</h1>`;
    const hatImage = document.createElement("img");
    hatImage.style.width = "186px";
    hatImage.style.height = "150px";
    if (localProxy.playerHat !== "none") {
        hatImage.src = `assets/images/items/hats/${items.hats[localProxy.playerHat].image}`;
    }
    hatDisplay.appendChild(hatImage);
    const itemDisplay = document.createElement("div");
    itemDisplay.style.width = "186px";
    itemDisplay.style.height = "200px";
    itemDisplay.style.position = "absolute";
    itemDisplay.style.zIndex = 5;
    itemDisplay.style.border = "4px solid black";
    itemDisplay.style.borderTop = "0px solid black";
    itemDisplay.style.top = "calc(45% + 102px)";
    itemDisplay.style.left = "calc(25% + 190px)";
    itemDisplay.style.transform = "translate(-50%, -50%)";
    itemDisplay.innerHTML = `<h1 style="margin-left:8px;margin-top:0px;margin-bottom:0px;">Item:</h1>`;
    const itemImage = document.createElement("img");
    itemImage.style.width = "186px";
    itemImage.style.height = "150px";
    if (localProxy.playerItem !== "none") {
        itemImage.src = `assets/images/items/items/${items.items[localProxy.playerItem].image}`;
    }
    itemDisplay.appendChild(itemImage);
    const storeSelect = document.createElement("div");
    storeSelect.style.width = "500px";
    storeSelect.style.height = "400px";
    storeSelect.style.position = "absolute";
    storeSelect.style.zIndex = 5;
    storeSelect.style.top = "45%";
    storeSelect.style.left = "calc(25% + 3 * 186px + 28px - 50px)";
    storeSelect.style.border = "4px solid black";
    storeSelect.style.transform = "translate(-50%, -50%)";
    const categories = ["armor", "hats", "items"];
    const displays = [armorImage, hatImage, itemImage]
    categories.forEach((category, ii) => {
        const display = displays[ii];
        const categoryButton = document.createElement("button");
        categoryButton.innerHTML = category[0].toUpperCase() + category.slice(1);
        storeSelect.appendChild(categoryButton);
        categoryButton.classList.add("menu-btn");
        categoryButton.onclick = () => {
            storeContent.innerHTML = "";
            Object.keys(items[category]).forEach((item, i) => {
                const itemDiv = document.createElement("div")
                itemDiv.innerHTML = `<h3>${items[category][item].title}</h3><p>${items[category][item].description}</p>`;
                itemDiv.style.padding = "8px";
                itemDiv.style.border = "2px solid black";
                if (i === Object.keys(items[category]).length - 1) {
                    itemDiv.style.borderBottom = "4px solid black";
                }
                const selectButton = document.createElement("button");
                if (localProxy.unlockedStuff.includes(item)) {
                    selectButton.innerHTML = "Select";
                    selectButton.style.width = "100px";
                } else {
                    selectButton.innerHTML = `Buy for ${items[category][item].cost} coins`;
                    selectButton.style.width = "175px";
                }
                selectButton.style.float = "right";
                selectButton.style.fontSize = "16px";
                selectButton.style.padding = "8px";
                selectButton.classList.add("btn");
                storeContent.appendChild(selectButton);
                storeContent.appendChild(itemDiv);
                selectButton.onclick = () => {
                    if (selectButton.innerHTML === "Select") {
                        localProxy["player" + category[0].toUpperCase() + category.slice(1, category.endsWith("s") ? category.length - 1 : category.length)] = item;
                        display.src = `assets/images/items/${category}/${items[category][item].image}`;
                        if (mainScene.player) {
                            if (localProxy.playerHat === "featheredCap") {
                                mainScene.player.health = 75;
                                mainScene.player.maxHealth = 75;
                            } else if (localProxy.playerHat === "umbrella") {
                                mainScene.player.health = 65;
                                mainScene.player.maxHealth = 65;
                                mainScene.player.body.setGravity(0, -9.81 * 0.5, 0)
                            } else {
                                mainScene.player.health = 100;
                                mainScene.player.maxHealth = 100;
                            }
                        }
                    } else {
                        if (localProxy.coins >= items[category][item].cost && transactionSettled) {
                            subtractCoins(items[category][item].cost);
                            localProxy.unlockedStuff = localProxy.unlockedStuff.concat(item);
                            selectButton.innerHTML = "Select";
                            selectButton.style.width = "100px";
                        }
                    }
                }
            })
        }
    });
    const storeContent = document.createElement("div");
    storeContent.style.borderTop = "4px solid black";
    storeContent.style.height = "88%";
    storeContent.style.overflowY = "scroll";
    storeSelect.appendChild(storeContent);
    const backButton = document.createElement("button");
    backButton.classList.add("btn");
    backButton.zIndex = 5;
    backButton.style.position = "absolute";
    backButton.style.left = "50%";
    backButton.style.top = "80%";
    backButton.style.transform = "translate(-50%, -50%)";
    backButton.innerHTML = "Back";
    backButton.style.zIndex = 5;
    backButton.onclick = () => {
        mainMenu();
    }
    menu.appendChild(storeSelect);
    menu.appendChild(armorDisplay);
    menu.appendChild(hatDisplay);
    menu.appendChild(itemDisplay);
    menu.appendChild(backButton);
}
const mainMenu = () => {
    menu.innerHTML = `<img style="position: absolute;left:50%;top:7.5%;transform:translate(-50%, -50%);z-index:5;" src="assets/images/logo.gif">`;
    const levelSelectButton = document.createElement("button");
    levelSelectButton.classList.add("btn");
    levelSelectButton.style.zIndex = 5;
    levelSelectButton.style.position = "absolute";
    levelSelectButton.style.left = "50%";
    levelSelectButton.style.top = "20%";
    levelSelectButton.style.transform = "translate(-50%, -50%)";
    levelSelectButton.innerHTML = "Level Select";
    levelSelectButton.onclick = () => {
        levelSelect();
    }
    const shopButton = document.createElement("button");
    shopButton.classList.add("btn");
    shopButton.style.zIndex = 5;
    shopButton.style.position = "absolute";
    shopButton.style.left = "50%";
    shopButton.style.top = "31%";
    shopButton.style.transform = "translate(-50%, -50%)";
    shopButton.innerHTML = "Shop";
    shopButton.onclick = () => {
        shop();
    }
    menu.appendChild(levelSelectButton);
    menu.appendChild(shopButton);
}
mainMenu();
resetButton.onclick = () => {
    mainScene.removeEnemy();
    mainScene.hide();
    resetButton.style.display = "none";
    menu.innerHTML = "";
    gameOverMessage.innerHTML = "";
    levelSelect();
}
document.addEventListener('contextmenu', e => {
    if (menu.innerHTML === "") {
        e.preventDefault();
    }
});
const playerWin = () => {
    const levelWins = localProxy.levelWins;
    if (!levelWins[currLevel]) {
        levelWins[currLevel] = 1;
    } else {
        levelWins[currLevel]++;
    }
    addCoins(levelCoinYield[currLevel][levelWins[currLevel] - 1] ? levelCoinYield[currLevel][levelWins[currLevel] - 1] : levelCoinYield[currLevel][levelCoinYield[currLevel].length - 1]);
    localProxy.levelWins = levelWins;
    if (localProxy.maxLevelUnlocked === currLevel) {
        localProxy.maxLevelUnlocked++;
    }
}
const padTo = num => {
    num = Math.floor(num).toString();
    while (num.length < 4) {
        num = "0" + num;
    }
    return num;
}
let transactionSettled = true;
const addCoins = num => {
    transactionSettled = false;
    let addInterval = setInterval(() => {
        localProxy.coins += Math.ceil(num / 10);
        num -= Math.ceil(num / 10);
        if (num < 2) {
            localProxy.coins += 1;
            transactionSettled = true;
            clearInterval(addInterval);
        }
        localProxy.coins = Math.min(localProxy.coins, 9999);
    }, 30)
}
const subtractCoins = num => {
    transactionSettled = false;
    num *= -1;
    num -= 9;
    let addInterval = setInterval(() => {
        localProxy.coins += Math.ceil(num / 10);
        num -= Math.ceil(num / 10);
        if (num > -10) {
            //localProxy.coins += 1;
            transactionSettled = true;
            clearInterval(addInterval);
        }
        localProxy.coins = Math.max(localProxy.coins, 0);
    }, 30)
}
setInterval(() => {
    document.getElementById("coinDisplay").innerHTML = padTo(localProxy.coins, 4);
    localProxy.coins = Math.min(localProxy.coins, 9999);
    localProxy.coins = Math.max(localProxy.coins, 0);
});