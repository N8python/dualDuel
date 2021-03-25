const weightSelection = (obj) => {
    if (Array.isArray(obj)) {
        const total = obj.reduce((t, v) => t + v.weight, 0);
        let threshold = Math.random() * total;
        let runningTotal = 0;
        for (const o of obj) {
            runningTotal += o.weight;
            if (runningTotal >= threshold) {
                return o;
            }
        }
    } else {
        const total = Object.values(obj).reduce((t, v) => t + v.weight, 0);
        let threshold = Math.random() * total;
        let runningTotal = 0;
        for (const key of Object.keys(obj)) {
            runningTotal += obj[key].weight;
            if (runningTotal >= threshold) {
                return key;
            }
        }
    }
}
class BossEnemyAI extends EnemyAI {
    constructor(enemy) {
        super(enemy, 500);
        this.enemy.animation.play('Idle');
        this.enemy.isBoss = true;
        this.enemy.aggro = false;
        this.enemy.aggroState = "none";
        this.enemy.currAttack = {};
        this.enemy.attackTick = 0;
        this.enemy.attackTree = {
            stage: 0,
            groups: {
                close: {
                    weight: 3,
                    cooldown: 0,
                    attacks: [{
                        name: "hit",
                        animations: ["Hit1", "Hit2", "Hit3"],
                        weight: 3,
                        defaultWeight: 3,
                        cooldown: 0,
                        stage: 1
                    }, {
                        name: "block",
                        animations: ["Block1", "Block2"],
                        weight: 1,
                        defaultWeight: 1,
                        cooldown: 0,
                        stage: 1
                    }, {
                        name: "push",
                        animations: ["Push"],
                        weight: 2,
                        defaultWeight: 2,
                        cooldown: 60,
                        stage: 3
                    }, {
                        name: "throw",
                        animations: ["Throwup"],
                        weight: 1,
                        defaultWeight: 1,
                        cooldown: 60,
                        stage: 3
                    }]
                },
                medium: {
                    weight: 2,
                    cooldown: 0,
                    attacks: [{
                        name: "smash",
                        animations: ["Smash1", "Smash2"],
                        weight: 2,
                        defaultWeight: 2,
                        cooldown: 0,
                        stage: 1,
                    }, {
                        name: "bombThrow",
                        animations: ["Throw"],
                        weight: 1,
                        defaultWeight: 1,
                        cooldown: 60,
                        stage: 2
                    }, {
                        name: "shockwave",
                        animations: ["Shockwave"],
                        weight: 2,
                        defaultWeight: 2,
                        cooldown: 120,
                        stage: 3
                    }]
                },
                far: {
                    weight: 1,
                    cooldown: 0,
                    attacks: [{
                        name: "iceRay",
                        animations: ["Iceray"],
                        weight: 2,
                        defaultWeight: 2,
                        cooldown: 90,
                        stage: 2
                    }, {
                        name: "lightning",
                        animations: ["Lightning"],
                        weight: 1,
                        defaultWeight: 1,
                        cooldown: 180,
                        stage: 3
                    }, {
                        name: "jumpSlash",
                        animations: ["Jumpslash1", "Jumpslash2"],
                        weight: 2,
                        defaultWeight: 2,
                        cooldown: 60,
                        stage: 2
                    }]
                }
            }
        }
        this.enemy.animation.mixer.addEventListener("loop", e => {
            if (e.action.getClip().isAttack && this.enemy && this.enemy.body && gameOverMessage.innerHTML === "") {
                this.enemy.attackTick = 0;
                this.enemy.playRunNext = true;
                this.enemy.aggroState = "pursue";
                Object.values(this.enemy.attackTree.groups).find(group => group.attacks.includes(this.enemy.currAttack)).cooldown = this.enemy.currAttack.cooldown;
            }
            if (e.action.getClip().isRoar && this.enemy && this.enemy.body && gameOverMessage.innerHTML === "") {
                this.enemy.attackTick = 0;
                this.enemy.playRunNext = true;
                this.enemy.aggroState = "pursue";
            }
        });
    }
    update(target, ground) {
        //const futurePos = futurePlayerPos(this.enemy.position.distanceTo(player.position) / 20);
        //console.log(this.enemy.body.position);
        Object.values(this.enemy.attackTree.groups).forEach(group => {
            group.cooldown--;
        });
        super.update(target, ground);
        this.stayUp(1);
        if (this.enemy.health === 0) {
            if (!this.enemy.dead) {
                resetButton.style.display = "block";
                gameOverMessage.innerHTML = "You Won!";
                playerWin();
                this.enemy.dead = true;
                this.enemy.animation.play("Death", 120, false);
            }
        }
        if (this.enemy.dead) {
            return;
        }
        this.enemy.blocking = false;
        if ((this.enemy.position.distanceTo(target.position) < 9 || this.enemy.health < this.enemy.maxHealth || this.enemy.aggro) && target.health > 0) {
            if (!this.enemy.aggro) {
                this.enemy.animation.play("Roar");
                soundManager.roar.setVolume(soundManager.random(0.3, 0.6) * localProxy.sfxVolume);
                soundManager.roar.rate(soundManager.random(0.75, 1.25));
                soundManager.roar.play();
                this.enemy.aggroState = "roar";
                this.enemy.animation.mixer._actions.forEach(x => {
                    if (x.getClip().isRoar) {
                        x.setEffectiveTimeScale(2.5);
                    }
                });
            }
            if (this.enemy.attackTree.stage === 1 && this.enemy.health < 400 && this.enemy.aggroState !== "roar") {
                this.enemy.bomb.visible = false;
                this.enemy.animation.play("Roar");
                soundManager.roar.setVolume(soundManager.random(0.3, 0.6) * localProxy.sfxVolume);
                soundManager.roar.rate(soundManager.random(0.75, 1.25));
                soundManager.roar.play();
                this.enemy.aggroState = "roar";
                this.enemy.animation.mixer._actions.forEach(x => {
                    if (x.getClip().isRoar) {
                        x.setEffectiveTimeScale(2.5);
                    }
                });
            }
            if (this.enemy.attackTree.stage === 2 && this.enemy.health < 250 && this.enemy.aggroState !== "roar") {
                this.enemy.bomb.visible = false;
                this.enemy.animation.play("Roar");
                soundManager.roar.setVolume(soundManager.random(0.3, 0.6) * localProxy.sfxVolume);
                soundManager.roar.rate(soundManager.random(0.75, 1.25));
                soundManager.roar.play();
                this.enemy.aggroState = "roar";
                this.enemy.animation.mixer._actions.forEach(x => {
                    if (x.getClip().isRoar) {
                        x.setEffectiveTimeScale(2.5);
                    }
                });
            }
            this.enemy.aggro = true;
            if (this.enemy.aggroState === "pursue") {
                this.rotateTowards(player.position.x, player.position.z, 4);
                this.moveYDir(0.2);
                this.moveYDir(0.125, 0.975, (Math.PI / 2) * Math.sin(performance.now() / 500));
                if (this.enemy.position.distanceTo(player.position) <= 7.5) {
                    this.enemy.playRunNext = false;
                    if (this.enemy.position.distanceTo(player.position) <= 3) {
                        this.enemy.attackTree.groups.close.weight = 3;
                        this.enemy.attackTree.groups.medium.weight = 2;
                        this.enemy.attackTree.groups.far.weight = 1;
                    } else if (this.enemy.position.distanceTo(player.position) <= 5.25) {
                        this.enemy.attackTree.groups.close.weight = 0;
                        this.enemy.attackTree.groups.medium.weight = 2;
                        this.enemy.attackTree.groups.far.weight = 1;
                    } else if (this.enemy.position.distanceTo(player.position) <= 7.5) {
                        this.enemy.attackTree.groups.close.weight = 0;
                        this.enemy.attackTree.groups.medium.weight = 0;
                        this.enemy.attackTree.groups.far.weight = 1;
                    }
                    Object.values(this.enemy.attackTree.groups).forEach(group => {
                        if (group.cooldown > 0) {
                            group.weight = 0;
                        }
                        let availableAttacks = group.attacks.filter(attack => {
                            return attack.stage <= this.enemy.attackTree.stage;
                        })
                        if (availableAttacks.length === 0) {
                            group.weight = 0;
                        }
                    })
                    if (this.enemy.attackTree.groups.medium.weight + this.enemy.attackTree.groups.close.weight + this.enemy.attackTree.groups.far.weight > 0) {
                        const groupToUse = weightSelection(this.enemy.attackTree.groups);
                        let availableAttacks = this.enemy.attackTree.groups[groupToUse].attacks.filter(attack => {
                            return attack.stage <= this.enemy.attackTree.stage;
                        });
                        const attack = weightSelection(availableAttacks);
                        attack.weight = attack.defaultWeight;
                        this.enemy.currAttack = attack;
                        this.enemy.aggroState = attack.name;
                        this.enemy.animation.play(attack.animations[Math.floor(Math.random() * attack.animations.length)]);
                        availableAttacks.forEach(a => {
                            if (a !== attack) {
                                a.weight++;
                            }
                        })
                    }
                } else if (this.enemy.playRunNext) {
                    this.enemy.playRunNext = false;
                    this.enemy.animation.play("Running");
                }
            } else if (this.enemy.aggroState === "iceRay") {
                this.rotateTowards(player.position.x, player.position.z, 4);
                this.enemy.attackTick++;
                if (this.enemy.attackTick === 60) {
                    soundManager.ice.setVolume(soundManager.random(0.75, 1.25) * localProxy.sfxVolume);
                    soundManager.ice.rate(soundManager.random(0.75, 1.25));
                    soundManager.ice.play();
                    projectiles.push(new Ice({
                        scene: mainScene,
                        x: this.enemy.position.x + Math.sin(this.enemy.body.rotation.y),
                        y: this.enemy.position.y + 0.85,
                        z: this.enemy.position.z + Math.cos(this.enemy.body.rotation.y),
                        xVel: 15 * Math.sin(this.enemy.body.rotation.y),
                        yVel: 0,
                        zVel: 15 * Math.cos(this.enemy.body.rotation.y)
                    }));
                }
            } else if (this.enemy.aggroState === "hit") {
                this.rotateTowards(player.position.x, player.position.z, 4);
                this.enemy.attackTick++;
                if (this.enemy.attackTick === 40) {
                    soundManager.slashLong.setVolume(soundManager.random(0.4, 0.6) * localProxy.sfxVolume);
                    soundManager.slashLong.rate(soundManager.random(0.75, 1.25));
                    soundManager.slashLong.play();
                    if (this.enemy.position.distanceTo(player.position) < 3.5) {
                        if (blocking && cooldown < 10) {
                            targetCooldown = 100;
                        } else {
                            player.body.setVelocity(player.body.velocity.x + 6 * Math.sin(this.enemy.body.rotation.y), player.body.velocity.y + 4, player.body.velocity.z + 6 * Math.cos(this.enemy.body.rotation.y));
                            if (target.health) {
                                playerTakeDamage(Math.floor(Math.random() * 8 + 8), "melee");
                            }
                        }
                    }
                }
            } else if (this.enemy.aggroState === "push") {
                this.rotateTowards(player.position.x, player.position.z, 4);
                this.enemy.attackTick++;
                if (this.enemy.attackTick === 75) {
                    soundManager.slashLong.setVolume(soundManager.random(0.4, 0.6) * localProxy.sfxVolume);
                    soundManager.slashLong.rate(soundManager.random(0.75, 1.25));
                    soundManager.slashLong.play();
                    if (this.enemy.position.distanceTo(player.position) < 3.5) {
                        if (blocking && cooldown < 10) {
                            targetCooldown = 100;
                        } else {
                            player.body.setVelocity(player.body.velocity.x + 10 * Math.sin(this.enemy.body.rotation.y), player.body.velocity.y + 2, player.body.velocity.z + 10 * Math.cos(this.enemy.body.rotation.y));
                            if (target.health) {
                                playerTakeDamage(Math.floor(Math.random() * 10 + 8), "melee");
                            }
                        }
                    }
                }
            } else if (this.enemy.aggroState === "throw") {
                this.rotateTowards(player.position.x, player.position.z, 4);
                this.enemy.attackTick++;
                if (this.enemy.attackTick === 60) {
                    soundManager.slashLong.setVolume(soundManager.random(0.4, 0.6) * localProxy.sfxVolume);
                    soundManager.slashLong.rate(soundManager.random(0.75, 1.25));
                    soundManager.slashLong.play();
                    if (this.enemy.position.distanceTo(player.position) < 3.5) {
                        if (blocking && cooldown < 10) {
                            targetCooldown = 100;
                        } else {
                            player.body.setVelocity(player.body.velocity.x + 5 * Math.sin(this.enemy.body.rotation.y), player.body.velocity.y + 8, player.body.velocity.z + 5 * Math.cos(this.enemy.body.rotation.y));
                            if (target.health) {
                                playerTakeDamage(Math.floor(Math.random() * 10 + 8), "melee");
                            }
                        }
                    }
                }
            } else if (this.enemy.aggroState === "smash") {
                this.rotateTowards(player.position.x, player.position.z, 4);
                this.enemy.attackTick++;
                if (this.enemy.attackTick === 60) {
                    if (this.enemy.position.distanceTo(player.position) < 3.5) {
                        if (blocking && cooldown < 10) {
                            targetCooldown = 100;
                        } else {
                            player.body.setVelocity(player.body.velocity.x + 6 * Math.sin(this.enemy.body.rotation.y), player.body.velocity.y + 6, player.body.velocity.z + 6 * Math.cos(this.enemy.body.rotation.y));
                            if (target.health) {
                                playerTakeDamage(Math.floor(Math.random() * 10 + 12), "melee");
                            }
                        }
                    }
                }
            } else if (this.enemy.aggroState === "jumpSlash") {
                this.rotateTowards(player.position.x, player.position.z, 4);
                this.enemy.attackTick++;
                if (this.enemy.attackTick === 1) {
                    this.enemy.body.setVelocityY(this.enemy.body.velocity.y + 4);
                    this.moveYDir(4);
                }
                if (this.enemy.attackTick === 75) {
                    soundManager.slashLong.setVolume(soundManager.random(0.4, 0.6) * localProxy.sfxVolume);
                    soundManager.slashLong.rate(soundManager.random(0.75, 1.25));
                    soundManager.slashLong.play();
                    if (this.enemy.position.distanceTo(player.position) < 3.5) {
                        if (blocking && cooldown < 10) {
                            targetCooldown = 100;
                        } else {
                            player.body.setVelocity(player.body.velocity.x + 6 * Math.sin(this.enemy.body.rotation.y), player.body.velocity.y + 6, player.body.velocity.z + 6 * Math.cos(this.enemy.body.rotation.y));
                            if (target.health) {
                                playerTakeDamage(Math.floor(Math.random() * 12 + 12), "melee");
                            }
                        }
                    }
                }
            } else if (this.enemy.aggroState === "bombThrow") {
                this.rotateTowards(player.position.x, player.position.z, 4);
                this.enemy.attackTick++;
                if (this.enemy.attackTick === 1) {
                    this.enemy.bomb.visible = true;
                }
                if (this.enemy.attackTick === 50) {
                    this.enemy.bomb.visible = false;
                    projectiles.push(new Bomb({
                        scene: mainScene,
                        model: mainScene.enemy.bombModel,
                        x: this.enemy.position.x + 0.33 * Math.sin(this.enemy.body.rotation.y),
                        y: this.enemy.position.y + 0.75,
                        z: this.enemy.position.z + 0.33 * Math.cos(this.enemy.body.rotation.y),
                        xVel: 5 * Math.sin(this.enemy.body.rotation.y),
                        yVel: 0,
                        zVel: 5 * Math.cos(this.enemy.body.rotation.y),
                        tick: 75
                    }));
                }
            } else if (this.enemy.aggroState === "shockwave") {
                this.rotateTowards(player.position.x, player.position.z, 4);
                this.enemy.attackTick++;
                if (this.enemy.attackTick === 80) {
                    soundManager.shockwave.setVolume(soundManager.random(0.75, 1.25) * localProxy.sfxVolume);
                    soundManager.shockwave.rate(soundManager.random(0.75, 1.25));
                    soundManager.shockwave.play();
                    mainScene.shockwave.emitters[0].position.x = this.enemy.position.x + 1.5 * Math.sin(this.enemy.body.rotation.y);
                    mainScene.shockwave.emitters[0].position.y = this.enemy.position.y + 0.2;
                    mainScene.shockwave.emitters[0].position.z = this.enemy.position.z + 1.5 * Math.cos(this.enemy.body.rotation.y);
                    mainScene.shockwave.emitters[0].currentEmitTime = 0;
                    dealExplodeDamage({
                        x: this.enemy.position.x + 1.5 * Math.sin(this.enemy.body.rotation.y),
                        y: this.enemy.position.y + 0.2,
                        z: this.enemy.position.z + 1.5 * Math.cos(this.enemy.body.rotation.y)
                    }, 30, 1.5, 8);
                    if (player.position.distanceTo(this.enemy.position) < 5) {
                        player.body.setVelocity(player.body.velocity.x + 12 * Math.sin(this.enemy.body.rotation.y), player.body.velocity.y + 5, player.body.velocity.z + 12 * Math.cos(this.enemy.body.rotation.y));
                    }
                }
            } else if (this.enemy.aggroState === "lightning") {
                this.rotateTowards(player.position.x, player.position.z, 4);
                this.enemy.attackTick++;
                if (this.enemy.attackTick === 60) {
                    soundManager.lightning.setVolume(soundManager.random(0.75, 1.25) * localProxy.sfxVolume);
                    soundManager.lightning.rate(soundManager.random(0.75, 1.25));
                    soundManager.lightning.play();
                    projectiles.push(new Dynamite({
                        scene: mainScene,
                        model: this.enemy.lightningModel,
                        x: this.enemy.position.x,
                        y: this.enemy.position.y + 2,
                        z: this.enemy.position.z,
                        xVel: 3 * Math.sin(this.enemy.body.rotation.y),
                        yVel: 0,
                        zVel: 3 * Math.cos(this.enemy.body.rotation.y),
                        antigravity: true,
                        homing: true,
                        lightning: true
                    }));
                    projectiles.push(new Dynamite({
                        scene: mainScene,
                        model: this.enemy.lightningModel,
                        x: this.enemy.position.x + Math.random() * 2 - 1,
                        y: this.enemy.position.y + 2,
                        z: this.enemy.position.z + Math.random() * 2 - 1,
                        xVel: 3 * Math.sin(this.enemy.body.rotation.y),
                        yVel: 0,
                        zVel: 3 * Math.cos(this.enemy.body.rotation.y),
                        antigravity: true,
                        homing: true,
                        lightning: true
                    }));
                    projectiles.push(new Dynamite({
                        scene: mainScene,
                        model: this.enemy.lightningModel,
                        x: this.enemy.position.x + Math.random() * 2 - 1,
                        y: this.enemy.position.y + 2,
                        z: this.enemy.position.z + Math.random() * 1 - 1,
                        xVel: 3 * Math.sin(this.enemy.body.rotation.y),
                        yVel: 0,
                        zVel: 3 * Math.cos(this.enemy.body.rotation.y),
                        antigravity: true,
                        homing: true,
                        lightning: true
                    }));
                }
            } else if (this.enemy.aggroState === "block") {
                this.rotateTowards(player.position.x, player.position.z, 4);
                this.enemy.attackTick++;
                this.enemy.blocking = true;
            } else if (this.enemy.aggroState === "roar") {
                this.rotateTowards(player.position.x, player.position.z, 4);
                this.enemy.attackTick++;
                if (this.enemy.attackTick === 1) {
                    this.enemy.attackTree.stage++;
                }
            }
        }
        if (target.health === 0) {
            if (this.enemy.aggro) {
                if (target.health === 0) {
                    this.enemy.animation.play("Dance");
                } else {
                    this.enemy.animation.play("Idle");
                }
            }
            this.enemy.aggro = false;
            this.enemy.attacking = false;
            this.enemy.aggroState = "none";
        }
    }
    static loadEnemy(instance) {
        instance.third.lights.ambientLight({ intensity: 0.125 });
        instance.enemy = new ExtendedObject3D();
        instance.third.load.fbx('boss-enemy').then(object => {
            //object.scale.set(0.0075, 0.0075, 0.0075);
            instance.enemy.add(object);
            instance.enemy.position.set(0, 1, 5);
            instance.enemy.scale.set(0.01, 0.01, 0.01);
            instance.third.animationMixers.add(instance.enemy.animation.mixer);
            instance.enemy.animation.add('Idle', object.animations[0]);
            /*instance.third.load.fbx("melee-sword").then(object => {
                object.children.pop();
                object.children.pop();
                object.children.pop();
                object.scale.set(0.03, 0.03, 0.03);
                //this.third.add.existing(object);
                instance.enemy.traverse(child => {
                    if (child.name === 'mixamorig6RightHand') {
                        //console.log("YAY")
                        //this.third.add.box({ width: 20, height: 20, depth: 20 })
                        child.add(object);
                    }
                })
            });*/
            instance.third.load.fbx("bomber-bomb").then(object => {
                instance.enemy.bombModel = object.clone();
                object.visible = false;
                object.scale.set(0.175, 0.175, 0.175);
                //object.rotation.z = 3 * Math.PI / 2;
                //object.position.z = 35;
                //this.third.add.existing(object);
                instance.enemy.traverse(child => {
                    if (child.name === 'MutantRightHand') {
                        //console.log("YAY")
                        //this.third.add.box({ width: 20, height: 20, depth: 20 })
                        child.add(object);
                        instance.enemy.bomb = object;
                    }
                })
            });
            instance.third.load.fbx("boss-bolt").then(object => {
                instance.enemy.lightningModel = object.clone();
                object.scale.set(0.05, 0.05, 0.03);
                //object.rotation.z = 3 * Math.PI / 2;
                //object.position.z = 35;
                // mainScene.third.add.existing(object);
            });
            instance.third.add.existing(instance.enemy);
            instance.third.physics.add.existing(instance.enemy, { shape: 'box', ignoreScale: true, offset: { y: -0.5 } });
            objects.push(instance.enemy);
            instance.enemy.loaded = true;
            //animations.slice(1).forEach(key => {
            /*this.third.load.fbx(`Warrior Running.fbx`).then(object => {
                //console.log(JSON.stringify(object.animations[0]));
                this.enemy.animation.add("R", THREE.AnimationClip.parse(JSON.parse(JSON.stringify(object.animations[0].toJSON()))));
                //this.enemy.animation.play('R');
                //this.enemy.animation.mixer._actions[0].setEffectiveWeight(1);
                //this.enemy.animation.mixer._actions[1].setEffectiveWeight(0);
                this.third.load.fbx("Warrior Slash.fbx").then(object => {
                    this.enemy.animation.add("S", object.animations[0]);
                    //this.enemy.animation.play('S');
                    //this.enemy.animation.mixer._actions[2].setEffectiveWeight(0);
                    this.third.load.fbx("Warrior Death.fbx").then(object => {
                        this.enemy.animation.add("D", object.animations[0]);
                        this.enemyAI = new EnemyAI(this.enemy);
                    })
                });
            });*/
            /*instance.third.load.fbx(`./assets/enemies/bossEnemy/throwUp.fbx`).then(object => {
               console.log(JSON.stringify(object.animations[0]));
            });*/
            const animsToLoad = ["block1", "block2", "dance", "death", "hit1", "hit2", "hit3", "iceRay", "jumpSlash1", "jumpSlash2", "lightning", "push", "roar", "running", "shockwave", "smash1", "smash2", "throw", "throwUp"]; //["running", "slashing", "death", "celebrate"];
            const attacks = ["block1", "block2", "hit1", "hit2", "hit3", "iceRay", "jumpSlash1", "jumpSlash2", "lightning", "push", "shockwave", "smash1", "smash2", "throw", "throwUp"];
            (async() => {
                loading.innerHTML = `Loading Enemy Animations (0/${animsToLoad.length})...`;
                for (const anim of animsToLoad) {
                    loading.innerHTML = `Loading Enemy Animations (${animsToLoad.indexOf(anim)}/${animsToLoad.length})...`;
                    const animText = await fetch(`./assets/enemies/bossEnemy/animations/warrior-${anim}.json`);
                    const animJson = await animText.json();
                    const animClip = THREE.AnimationClip.parse(animJson);
                    if (attacks.includes(anim)) {
                        animClip.isAttack = true;
                    }
                    if (anim === "roar") {
                        animClip.isRoar = true;
                    }
                    instance.enemy.animation.add(anim[0].toUpperCase() + anim.slice(1).toLowerCase(), animClip);
                }
                instance.enemyAI = new BossEnemyAI(instance.enemy);
                loading.innerHTML = `Loaded!`;
                setTimeout(() => {
                    loading.innerHTML = "";
                })
            })();
            //})
            //this.third.add.existing(object);
            //this.third.physics.add.existing(object);
        });
    }
}