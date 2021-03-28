class BomberEnemyAI extends EnemyAI {
    constructor(enemy) {
        super(enemy, 200);
        this.enemy.animation.play('Idle');
        this.enemy.aggro = false;
        this.enemy.aggroState = "none";
        this.enemy.isBomber = true;
        this.enemy.runTick = 0;
        this.enemy.attackTick = 0;
        this.enemy.attackName = "";
        this.enemy.attackNext = false;
        this.enemy.bombChance = 0.2;
        this.enemy.animation.mixer.addEventListener("loop", e => {
            if (e.action.getClip().isAttack && this.enemy && this.enemy.body && gameOverMessage.innerHTML === "") {
                if (this.enemy.aggroState === "carry") {
                    projectiles.push(new Bomb({
                        scene: mainScene,
                        model: mainScene.enemy.bombModel,
                        x: this.enemy.position.x + 0.33 * Math.sin(this.enemy.body.rotation.y),
                        y: this.enemy.position.y + 0.6,
                        z: this.enemy.position.z + 0.33 * Math.cos(this.enemy.body.rotation.y),
                        xVel: 4 * Math.sin(this.enemy.body.rotation.y),
                        yVel: 0,
                        zVel: 4 * Math.cos(this.enemy.body.rotation.y)
                    }))
                }
                if (this.enemy.aggroState === "block" && this.enemy.position.distanceTo(player.position) < 3.5) {
                    this.enemy.attackTick = 0;
                    if (Math.random() < 0.5) {
                        this.enemy.aggroState = "attack";
                    } else {
                        this.enemy.animation.play("Throw");
                        this.enemy.aggroState = "throw";
                    }
                } else {
                    this.enemy.animation.play("Running");
                    this.enemy.aggroState = "pursue";
                    this.enemy.attackTick = 0;
                }
            }
        });
    }
    update(target, ground) {
        super.update(target, ground);
        const futurePos = futurePlayerPos(this.enemy.position.distanceTo(player.position) / 5, false);
        //const futurePos = futurePlayerPos(this.enemy.position.distanceTo(player.position) / 10);
        this.stayUp(1);
        if (this.enemy.health === 0) {
            if (!this.enemy.dead) {
                resetButton.style.display = "block";
                shopButton.style.display = "block";
                gameOverMessage.innerHTML = "You Won!";
                playerWin();
                this.enemy.dead = true;
                this.enemy.animation.play("Death", 120, false);
            }
        }
        if (this.enemy.dead) {
            return;
        }
        this.enemy.firelance.visible = true;
        this.enemy.dynamite.visible = true;
        this.enemy.bomb.visible = false;
        if ((this.enemy.position.distanceTo(target.position) < 7.5 || this.enemy.health < this.enemy.maxHealth || this.enemy.aggro) && !this.enemy.attacking && target.health > 0) {
            if (!this.enemy.aggro) {
                this.enemy.animation.play("Running");
                this.enemy.aggroState = "pursue";
            }
            this.enemy.aggro = true;
            this.stayUp(1);
            if (this.enemy.aggroState === "pursue") {
                this.enemy.runTick++;
                this.rotateTowards(player.position.x, player.position.z);
                this.moveYDir(0.2);
                this.stayUp(1);
                if (this.enemy.position.distanceTo(target.position) < 1.5 && this.enemy.runTick > 30) {
                    this.enemy.runTick = 0;
                    let fleeWeight = (1 - this.enemy.health / this.enemy.maxHealth) + 0.3;
                    if (Math.random() < fleeWeight) {
                        this.enemy.animation.play("Running");
                        this.enemy.aggroState = "flee";
                    }
                }
                if (this.enemy.position.distanceTo(target.position) < 4) {
                    if (Math.random() < 0.75 || this.enemy.attackNext) {
                        this.enemy.attackNext = false;
                        this.enemy.aggroState = "attack";
                    } else {
                        this.enemy.animation.play("Throw");
                        this.enemy.aggroState = "throw";
                    }
                }
                if (this.enemy.position.distanceTo(target.position) < 5 && this.enemy.position.distanceTo(target.position) > 4 && !this.enemy.attackNext) {
                    if (Math.random() < 0.5) {
                        this.enemy.attackNext = true;
                    }
                    if (Math.random() < this.enemy.bombChance) {
                        this.enemy.bombChance = 0.2;
                        this.enemy.animation.play("Carry");
                        this.enemy.aggroState = "carry";
                    } else {
                        this.enemy.animation.play("Throw");
                        this.enemy.aggroState = "throw";
                        this.enemy.bombChance += 0.1;
                    }
                }
            } else if (this.enemy.aggroState === "flee") {
                this.rotateTowards(-(player.position.x - this.enemy.position.x), -(player.position.z - this.enemy.position.z));
                this.moveYDir(0.25);
                this.stayUp(1);
                if (Math.random() < 0.02) {
                    this.enemy.aggroState = "pursue";
                }
            } else if (this.enemy.aggroState === "strafe") {
                this.rotateTowards(player.position.x, player.position.z, 4, this.enemy.strafeAngle);
                this.moveYDir(0.2);
                this.stayUp(1);
                if (Math.random() < 0.015) {
                    this.enemy.aggroState = "pursue";
                }
            } else if (this.enemy.aggroState === "block") {
                this.rotateTowards(player.position.x, player.position.z);
                this.stayUp(1);
            } else if (this.enemy.aggroState === "throw") {
                this.rotateTowards(futurePos.x, futurePos.z);
                this.stayUp(1);
                this.enemy.attackTick++;
                if (this.enemy.attackTick === 45) {
                    projectiles.push(new Dynamite({
                        scene: mainScene,
                        model: mainScene.enemy.dynamiteModel,
                        x: this.enemy.position.x + Math.sin(this.enemy.body.rotation.y),
                        y: this.enemy.position.y + 0.85,
                        z: this.enemy.position.z + Math.cos(this.enemy.body.rotation.y),
                        xVel: 7 * Math.sin(this.enemy.body.rotation.y),
                        yVel: 0,
                        zVel: 7 * Math.cos(this.enemy.body.rotation.y),
                        fuse: 15
                    }));
                }
            } else if (this.enemy.aggroState === "carry") {
                this.rotateTowards(futurePos.x, futurePos.z);
                this.stayUp(1);
                this.enemy.firelance.visible = false;
                this.enemy.dynamite.visible = false;
                this.enemy.bomb.visible = true;
            } else if (this.enemy.aggroState === "attack") {
                this.rotateTowards(player.position.x, player.position.z);
                this.stayUp(1);
                if (this.enemy.attackTick === 0) {
                    const attacks = ["Slashing", "Jab", "Jab2", "Sweep", "Sweep2"];
                    const attack = attacks[Math.floor(Math.random() * attacks.length)];
                    this.enemy.animation.play(attack);
                    this.enemy.attackDuration = 60 * ({
                        "Slashing": 1.5,
                        "Jab": 3.0333333015441895,
                        "Jab2": 2.200000047683716,
                        "Sweep": 2.0333333015441895,
                        "Sweep2": 2.633333444595337
                    })[attack];
                    this.enemy.attackName = attack;
                }
                this.enemy.attackTick++;
                mainScene.smoke.emitters[0].position.x = this.enemy.position.x + Math.sin(this.enemy.body.rotation.y);
                mainScene.smoke.emitters[0].position.z = this.enemy.position.z + Math.cos(this.enemy.body.rotation.y);
                mainScene.smoke.emitters[0].position.y = 0.7;
                if (this.enemy.attackTick % Math.floor(this.enemy.attackDuration / (this.enemy.attackName.startsWith("Jab") ? 3 : 2.25)) === 0) {
                    mainScene.smoke.emitters[0].position.x = this.enemy.position.x + Math.sin(this.enemy.body.rotation.y);
                    mainScene.smoke.emitters[0].position.z = this.enemy.position.z + Math.cos(this.enemy.body.rotation.y);
                    mainScene.smoke.emitters[0].position.y = 0.7;
                    mainScene.smoke.emitters[0].currentEmitTime = 0;
                    dealExplodeDamage(new THREE.Vector3(this.enemy.position.x + Math.sin(this.enemy.body.rotation.y), 0.7, this.enemy.position.z + Math.cos(this.enemy.body.rotation.y)), 10, 1.75, 2);
                    soundManager.slashLong.setVolume(soundManager.random(0.4, 0.6) * localProxy.sfxVolume);
                    soundManager.slashLong.rate(soundManager.random(0.75, 1.25));
                    soundManager.slashLong.play();
                    if (this.enemy.position.distanceTo(target.position) < 3.5) {
                        if (blocking) {
                            targetCooldown = 75;
                        } else if (!this.dead) {
                            if (this.enemy.attackName.startsWith("Jab")) {
                                target.body.setVelocity(target.body.velocity.x + 6 * Math.sin(this.enemy.body.rotation.y), target.body.velocity.y, target.body.velocity.z + 6 * Math.cos(this.enemy.body.rotation.y));
                                if (target.health) {
                                    playerTakeDamage(Math.floor(Math.random() * 2 + 4), "melee");
                                }
                            } else if (this.enemy.attackName.startsWith("Sweep")) {
                                target.body.setVelocity(target.body.velocity.x + 6.5 * Math.sin(this.enemy.body.rotation.y), target.body.velocity.y + 4.5, target.body.velocity.z + 6.5 * Math.cos(this.enemy.body.rotation.y));
                                if (target.health) {
                                    playerTakeDamage(Math.floor(Math.random() * 5 + 7), "melee");
                                }
                            } else {
                                target.body.setVelocity(target.body.velocity.x + 5 * Math.sin(this.enemy.body.rotation.y), target.body.velocity.y + 4, target.body.velocity.z + 5 * Math.cos(this.enemy.body.rotation.y));
                                if (target.health) {
                                    playerTakeDamage(Math.floor(Math.random() * 4 + 6), "melee");
                                }
                            }
                        }
                    }
                }
            }
        }
        if (Math.abs(target.position.y - this.enemy.position.y) > 8 || target.health === 0) {
            if (this.enemy.aggro) {
                if (target.health === 0) {
                    this.enemy.animation.play("Celebrate");
                } else {
                    this.enemy.animation.play("Idle");
                }
            }
            this.enemy.aggro = false;
            this.enemy.aggroState = "none";
            this.enemy.attacking = false;
        }
    }
    static loadEnemy(instance) {
        instance.third.lights.ambientLight({ intensity: 0.125 });
        instance.enemy = new ExtendedObject3D();
        instance.third.load.fbx('bomber-enemy').then(object => {
            //object.scale.set(0.0075, 0.0075, 0.0075);
            instance.enemy.add(object);
            instance.enemy.position.set(0, 1, 5);
            instance.enemy.scale.set(0.0075, 0.0075, 0.0075);
            instance.third.animationMixers.add(instance.enemy.animation.mixer);
            instance.enemy.animation.add('Idle', object.animations[0]);
            instance.third.load.fbx("bomber-firelance").then(object => {
                object.scale.set(30, 30, 30);
                object.rotation.x = Math.PI;
                object.position.y = 10;
                object.position.x = 30;
                object.position.z = 5;
                //this.third.add.existing(object);
                instance.enemy.traverse(child => {
                    if (child.name === 'mixamorig1RightHand') {
                        //console.log("YAY")
                        //this.third.add.box({ width: 20, height: 20, depth: 20 })
                        child.add(object);
                        instance.enemy.firelance = object;
                    }
                })
            });
            instance.third.load.fbx("bomber-bomb").then(object => {
                instance.enemy.bombModel = object.clone();
                object.visible = false;
                object.scale.set(0.175, 0.175, 0.175);
                object.rotation.z = 3 * Math.PI / 2;
                object.position.z = 35;
                //this.third.add.existing(object);
                instance.enemy.traverse(child => {
                    if (child.name === 'mixamorig1RightHand') {
                        //console.log("YAY")
                        //this.third.add.box({ width: 20, height: 20, depth: 20 })
                        child.add(object);
                        instance.enemy.bomb = object;
                    }
                })
            });
            instance.third.load.fbx("bomber-dynamite").then(object => {
                instance.enemy.dynamiteModel = object.clone();
                object.scale.set(30, 30, 30);
                object.rotation.x = Math.PI;
                object.position.y = 10;
                //object.position.x = 30;
                object.position.z = 2.5;
                //this.third.add.existing(object);
                instance.enemy.traverse(child => {
                    if (child.name === 'mixamorig1LeftHand') {
                        //console.log("YAY")
                        //this.third.add.box({ width: 20, height: 20, depth: 20 })
                        child.add(object);
                        instance.enemy.dynamite = object;
                    }
                })
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
            const animsToLoad = ["running", "slashing", "jab", "jab2", "sweep", "sweep2", "death", "block", "celebrate", "throw", "carry"];
            const attacks = ["slashing", "jab", "jab2", "sweep", "sweep2", "block", "throw", "carry"];
            (async() => {
                loading.innerHTML = `Loading Enemy Animations (0/${animsToLoad.length})...`;
                for (const anim of animsToLoad) {
                    loading.innerHTML = `Loading Enemy Animations (${animsToLoad.indexOf(anim)}/${animsToLoad.length})...`;
                    const animText = await fetch(`./assets/enemies/bomberEnemy/animations/warrior-${anim}.json`);
                    const animJson = await animText.json();
                    const clip = THREE.AnimationClip.parse(animJson);
                    if (attacks.includes(anim)) {
                        clip.isAttack = true;
                    }
                    instance.enemy.animation.add(anim[0].toUpperCase() + anim.slice(1).toLowerCase(), clip);
                }
                instance.enemyAI = new BomberEnemyAI(instance.enemy);
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