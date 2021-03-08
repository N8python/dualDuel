class PistolEnemyAI extends EnemyAI {
    constructor(enemy) {
        super(enemy, 162);
        this.enemy.animation.play('Idle');
        this.enemy.aggro = false;
        this.enemy.aggroState = "none";
        this.enemy.strafeAngle = 0;
        this.enemy.bulletsToShoot = 0;
        this.enemy.bulletsLeft = 15;
        this.enemy.attackTick = 0;
        this.enemy.animation.mixer.addEventListener("loop", e => {
            if (e.action.getClip().duration === 1.1666666269302368 && this.enemy && this.enemy.body) {
                this.enemy.bulletsToShoot--;
                this.enemy.bulletsLeft--;
                if (this.enemy.bulletsToShoot === 0 || this.enemy.bulletsLeft < 1) {
                    if (this.enemy.bulletsLeft < 1) {
                        this.enemy.bulletsLeft = 0;
                    }
                    this.enemy.bulletsToShoot = 0;
                    this.enemy.animation.play("Running");
                    this.enemy.aggroState = "pursue";
                }
                this.enemy.body.transform();
                projectiles.push(new Arrow({
                    scene: mainScene,
                    model: mainScene.enemy.arrowModel,
                    x: this.enemy.position.x + 1 * Math.sin(this.enemy.body.rotation.y),
                    y: this.enemy.position.y + 1,
                    z: this.enemy.position.z + 1 * Math.cos(this.enemy.body.rotation.y),
                    angle: this.enemy.body.rotation.y,
                    target: player,
                    pool: false,
                    speed: 20,
                    bullet: true
                }));
            }
            if (e.action.getClip().duration === 3.299999952316284 && this.enemy && this.enemy.body) {
                this.enemy.bulletsLeft = 15;
                this.enemy.animation.play("Running");
                this.enemy.aggroState = "pursue";
            }
            if ((e.action.getClip().duration === 2.366666555404663 || e.action.getClip().duration === 2.633333444595337 || e.action.getClip().duration === 2.133333444595337) && this.enemy && this.enemy.body) {
                this.enemy.animation.play("Running");
                this.enemy.aggroState = "flee";
                this.enemy.knife.visible = false;
                this.enemy.attackTick = 0;
            }
        });
    }
    update(target, ground) {
        target = player;
        const futurePos = futurePlayerPos(this.enemy.position.distanceTo(player.position) / 20);
        super.update(target, ground);
        if (this.enemy.health === 0) {
            if (!this.enemy.dead) {
                resetButton.style.display = "block";
                gameOverMessage.innerHTML = "You Won!"
                this.enemy.dead = true;
                this.enemy.animation.play("Death", 120, false);
            }
        }
        if (this.enemy.dead) {
            return;
        }
        if ((this.enemy.position.distanceTo(target.position) < 7.5 || this.enemy.health < this.enemy.maxHealth || this.enemy.aggro) && !this.enemy.attacking && target.health > 0) {
            if (!this.enemy.aggro) {
                this.enemy.animation.play("Running");
                this.enemy.aggroState = "pursue";
            }
            this.enemy.aggro = true;
            this.stayUp(1);
            this.enemy.gun.rotation.x = 0;
            this.enemy.gun.position.z = 0;
            this.enemy.gun.position.y = -5;
            this.enemy.gun.position.x = -15;
            this.enemy.gun.rotation.y = 0;
            if (this.enemy.aggroState === "pursue") {
                this.rotateTowards(futurePos.x, futurePos.z);
                this.moveYDir(0.2);
                this.stayUp(1);
                if (this.enemy.position.distanceTo(target.position) < 2.5) {
                    let fleeWeight = (1 - this.enemy.health / this.enemy.maxHealth) + 0.3;
                    if (Math.random() < fleeWeight) {
                        this.enemy.aggroState = "flee";
                    } else {
                        this.enemy.strafeAngle = Math.random() * Math.PI / 8 + Math.PI / 6;
                        if (Math.random() < 0.5) {
                            this.enemy.strafeAngle *= -1;
                        }
                        this.enemy.aggroState = "strafe";
                    }
                }
                if (this.enemy.position.distanceTo(target.position) < 6.5 && this.enemy.bulletsLeft > 0) {
                    if (this.enemy.position.distanceTo(target.position) < 3 && Math.random() < 0.5) {
                        let seed = Math.random();
                        if (seed < 0.33) {
                            this.enemy.animation.play("Slashing");
                        } else if (seed < 0.67) {
                            this.enemy.animation.play("Slashing2");
                        } else {
                            this.enemy.animation.play("Slashing3");
                        }
                        this.enemy.knife.visible = true;
                        this.enemy.aggroState = "attack";
                    } else {
                        this.enemy.animation.play("Shoot");
                        this.enemy.aggroState = "shoot";
                        this.enemy.bulletsToShoot = Math.floor(Math.random() * 3) + 3;
                        this.enemy.animation.mixer._actions.forEach(x => {
                            if (x.getClip().duration === 1.1666666269302368) {
                                x.setEffectiveTimeScale(2);
                            }
                        });
                    }
                }
                if (this.enemy.bulletsLeft === 0 && this.enemy.position.distanceTo(target.position) > 4) {
                    this.enemy.animation.play("Reload");
                    this.enemy.aggroState = "reload";
                } else if (this.enemy.bulletsLeft === 0) {
                    if (this.enemy.position.distanceTo(target.position) < 2) {
                        if (seed < 0.33) {
                            this.enemy.animation.play("Slashing");
                        } else if (seed < 0.67) {
                            this.enemy.animation.play("Slashing2");
                        } else {
                            this.enemy.animation.play("Slashing3");
                        }
                        this.enemy.knife.visible = true;
                        this.enemy.aggroState = "attack";
                    } else {
                        this.enemy.aggroState = "flee";
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
            } else if (this.enemy.aggroState === "shoot") {
                this.rotateTowards(futurePos.x, futurePos.z);
                this.stayUp(1);
                this.enemy.gun.rotation.x = Math.PI / 2;
                this.enemy.gun.position.z = -10;
                this.enemy.gun.position.x = -12.5;
                this.enemy.gun.rotation.y = Math.PI / 8;
            } else if (this.enemy.aggroState === "reload") {
                this.enemy.gun.rotation.x = Math.PI / 2;
                this.rotateTowards(futurePos.x, futurePos.z);
                this.stayUp(1);
            } else if (this.enemy.aggroState === "attack") {
                this.rotateTowards(futurePos.x, futurePos.z);
                this.stayUp(1);
                this.enemy.attackTick++;
                if (this.enemy.attackTick % 40 === 0) {
                    if (this.enemy.position.distanceTo(target.position) < 3) {
                        target.body.setVelocity(target.body.velocity.x + 5 * Math.sin(this.enemy.body.rotation.y), target.body.velocity.y + 4, target.body.velocity.z + 5 * Math.cos(this.enemy.body.rotation.y));
                        if (target.health) {
                            playerTakeDamage(Math.floor(Math.random() * 3 + 5), "melee");
                        }
                    }
                }
            } else if (this.enemy.aggroState === "dodge") {
                this.rotateTowards(futurePos.x, futurePos.z);
                this.stayUp(1);
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
            this.enemy.attacking = false;
        }
    }
    static loadEnemy(instance) {
        instance.enemy = new ExtendedObject3D();
        instance.third.load.fbx('pistol-enemy').then(object => {
            //object.scale.set(0.0075, 0.0075, 0.0075);
            instance.enemy.add(object);
            instance.enemy.position.set(0, 1, 5);
            instance.enemy.scale.set(0.0075, 0.0075, 0.0075);
            instance.third.animationMixers.add(instance.enemy.animation.mixer);
            instance.enemy.animation.add('Idle', object.animations[0]);
            instance.third.load.fbx("pistol-pistol").then(object => {
                object.scale.set(2.25, 2.25, 2.25);
                object.position.x = -15;
                object.position.y = -5;
                //this.third.add.existing(object);
                let added = false;
                instance.enemy.traverse(child => {
                    if (child.name === 'swatRightHand' && !added) {
                        added = true;
                        //instance.third.add.box({ width: 20, height: 20, depth: 20 })
                        child.add(object);
                        instance.enemy.gun = object;
                    }
                })
            });
            instance.third.load.fbx("pistol-knife").then(object => {
                object.scale.set(5, 5, 5);
                object.rotation.z = Math.PI;
                object.position.x = 25;
                //object.position.y = -5;
                //this.third.add.existing(object);
                let added = false;
                instance.enemy.traverse(child => {
                    if (child.name === 'swatLeftHand' && !added) {
                        added = true;
                        //instance.third.add.box({ width: 20, height: 20, depth: 20 })
                        child.add(object);
                        instance.enemy.knife = object;
                        instance.enemy.knife.visible = false;
                    }
                })
            });
            instance.third.load.fbx("bullet").then(object => {
                instance.enemy.arrowModel = object;
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
            const animsToLoad = ["running", "slashing", "slashing2", "slashing3", "death", "celebrate", "dodge", "reload", "shoot"];
            (async() => {
                loading.innerHTML = `Loading Enemy Animations (0/${animsToLoad.length})...`;
                for (const anim of animsToLoad) {
                    loading.innerHTML = `Loading Enemy Animations (${animsToLoad.indexOf(anim)}/${animsToLoad.length})...`;
                    const animText = await fetch(`./assets/enemies/pistolEnemy/animations/warrior-${anim}.json`);
                    const animJson = await animText.json();
                    instance.enemy.animation.add(anim[0].toUpperCase() + anim.slice(1).toLowerCase(), THREE.AnimationClip.parse(animJson));
                }
                instance.enemyAI = new PistolEnemyAI(instance.enemy);
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