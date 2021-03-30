class RangedEnemyAI extends EnemyAI {
    constructor(enemy) {
        super(enemy, 150);
        this.enemy.animation.play('Idle');
        this.enemy.aggro = false;
        this.enemy.aggroState = "none";
        this.enemy.cooldown = 0;
        this.enemy.arrowTick = 0;
        this.enemy.attacking = false;
        this.enemy.animation.mixer.addEventListener("loop", e => {
            if (e.action.getClip().duration === 5 && this.enemy && this.enemy.body) {
                this.enemy.body.transform();
                this.enemy.arrowTick = 0;
                //this.enemy.animation.play("Idle");
                this.enemy.aggroState = "none";
                soundManager.bowShoot.setVolume(soundManager.random(1.25, 1.5) * localProxy.sfxVolume);
                soundManager.bowShoot.rate(soundManager.random(0.75, 1.25));
                soundManager.bowShoot.play();
                projectiles.push(new Arrow({
                    scene: mainScene,
                    model: mainScene.enemy.arrowModel,
                    x: this.enemy.position.x + 1 * Math.sin(this.enemy.body.rotation.y),
                    y: this.enemy.position.y + 0.8,
                    z: this.enemy.position.z + 1 * Math.cos(this.enemy.body.rotation.y),
                    angle: this.enemy.body.rotation.y,
                    target: player,
                    pool: false
                }));
                this.enemy.arrow.visible = false;
                this.enemy.bowArrow.visible = false;
                //new Arrow(mainScene, this.enemy.arrowModel, this.enemy.position.x, this.enemy.position.y, this.enemy.position.z)
            }
        })
    }
    update(target, ground) {
        target = player;
        const futurePos = futurePlayerPos(this.enemy.position.distanceTo(player.position) / 10);
        super.update(target, ground);
        this.stayUp(1);
        if (this.enemy.health === 0) {
            if (!this.enemy.dead) {
                resetButton.style.display = "block";
                gameOverMessage.innerHTML = "You Won!";
                shopButton.style.display = "block";
                playerWin();
                this.enemy.dead = true;
                this.enemy.animation.play("Death", 120, false);
            }
        }
        if (this.enemy.dead) {
            return;
        }
        this.enemy.cooldown--;
        if (this.enemy.cooldown === 0) {
            if (this.enemy.aggro && target.health > 0) {
                this.enemy.animation.play("Running");
                this.enemy.aggroState = "pursue";
                this.enemy.attacking = false;
            }
        }
        if (this.enemy.attacking) {
            this.rotateTowards(player.position.x, player.position.z);
        }
        if (this.enemy.dead) {
            return;
        }
        if (this.enemy.bow) {
            this.enemy.bow.scale.set(0.055, 0.055, 0.055);
            this.enemy.bowArrow.visible = false;
            this.enemy.arrow.visible = false;
        }
        if ((this.enemy.position.distanceTo(target.position) < 7.5 || this.enemy.health < this.enemy.maxHealth || this.enemy.aggro) && !this.enemy.attacking && target.health > 0) {
            if (!this.enemy.aggro) {
                this.enemy.animation.play("Running");
                this.enemy.aggroState = "pursue";
            }
            this.enemy.aggro = true;
            if (this.enemy.aggroState === "shootArrow") {
                this.rotateTowards(futurePos.x, futurePos.z);
                this.enemy.arrowTick++;
                if (this.enemy.bow) {
                    this.enemy.bow.scale.set(0.055, 0.055, 0.055 + this.enemy.arrowTick / 1500);
                }

                if (this.enemy.arrowTick > 50) {
                    this.enemy.arrow.visible = false;
                    this.enemy.bowArrow.visible = true;
                } else if (this.enemy.arrowTick > 20) {
                    this.enemy.arrow.visible = true;
                    this.enemy.bowArrow.visible = false;
                }
                /*if (this.enemy.arrowTick > 150) {
                    this.enemy.arrowTick = 0;
                    this.enemy.animation.play("Idle");
                    this.enemy.aggroState = "wait";
                }*/
            } else if (this.enemy.position.distanceTo(target.position) > 5) {
                if (this.enemy.aggroState !== "pursue") {
                    this.enemy.animation.play("Running");
                    this.enemy.aggroState = "pursue";
                }
                this.rotateTowards(player.position.x, player.position.z);
                this.moveYDir(0.2);
            } else if (this.enemy.position.distanceTo(target.position) < 3.5) {
                if (this.enemy.aggroState !== "flee") {
                    this.enemy.animation.play("Running");
                    this.enemy.aggroState = "flee";
                }
                this.rotateTowards(-(player.position.x - this.enemy.position.x), -(player.position.z - this.enemy.position.z));
                this.moveYDir(0.25);
            } else {
                this.rotateTowards(player.position.x, player.position.z);
                if (this.enemy.aggroState !== "wait") {
                    this.enemy.animation.play("Idle");
                    this.enemy.aggroState = "wait";
                }
                if (this.enemy.position.distanceTo(target.position) < 4.5) {
                    this.moveYDir(0, 0.95);
                }
                if (Math.random() < 0.05) {
                    //this.enemy.arrow.visible = true;
                    this.enemy.aggroState = "shootArrow";
                    this.enemy.animation.play("Shoot");
                    this.enemy.animation.mixer._actions.forEach(x => {
                        if (x.getClip().duration === 5) {
                            x.setEffectiveTimeScale(2.5);
                        }
                    });
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
            this.enemy.attacking = false;
        }
        if (this.enemy && this.enemy.body && this.enemy.position.distanceTo(target.position) < 2 && this.enemy.cooldown < 0 && target.health > 0) {
            if (!this.enemy.attacking) {
                this.enemy.animation.play("Slashing");
            }
            this.enemy.attacking = true;
            this.enemy.cooldown = 90;
            setTimeout(() => {
                if (this.enemy.position.distanceTo(target.position) < 3.5) {
                    if (blocking && target === player && cooldown < 10) {
                        targetCooldown = 100;
                    } else {
                        target.body.setVelocity(target.body.velocity.x + 5 * Math.sin(this.enemy.body.rotation.y), target.body.velocity.y + 4, target.body.velocity.z + 5 * Math.cos(this.enemy.body.rotation.y));
                        if (target.health) {
                            playerTakeDamage(Math.floor(Math.random() * 3 + 3), "melee");
                        }
                    }
                }
            }, 500);
        }
    }
    static loadEnemy(instance) {
        instance.enemy = new ExtendedObject3D();
        instance.third.load.fbx('ranged-enemy').then(object => {
            instance.enemy.add(object);
            instance.enemy.position.set(0, 1, 5);
            instance.enemy.scale.set(0.0075, 0.0075, 0.0075);
            instance.third.animationMixers.add(instance.enemy.animation.mixer);
            instance.enemy.animation.add('Idle', object.animations[0]);
            instance.third.load.fbx("ranged-bow").then(object => {
                object.children = [object.children[0], object.children[1], object.children[2]];
                object.scale.set(0.055, 0.055, 0.055);
                object.rotation.x = Math.PI / 2;
                //this.third.add.existing(object);
                instance.enemy.traverse(child => {
                    if (child.name === 'mixamorig8LeftHand') {
                        //console.log("YAY")
                        //this.third.add.box({ width: 20, height: 20, depth: 20 })
                        child.add(object);
                        instance.enemy.bow = object;
                        instance.third.load.fbx("arrow").then(arrow => {
                            arrow.scale.set(15, 6, 6);
                            arrow.rotation.z = Math.PI / 2;
                            child.add(arrow);
                            instance.enemy.bowArrow = arrow;
                        });
                    }
                })
            });
            instance.third.load.fbx("arrow").then(object => {
                instance.enemy.arrowModel = object;
                instance.enemy.traverse(child => {
                    if (child.name === 'mixamorig8RightHand') {
                        //console.log("YAY")
                        //this.third.add.box({ width: 20, height: 20, depth: 20 })
                        const arrowModel = instance.enemy.arrowModel.clone();
                        arrowModel.scale.set(15, 6, 6);
                        instance.enemy.arrow = arrowModel;
                        arrowModel.visible = false;
                        child.add(arrowModel);
                    }
                });
            });
            instance.third.load.fbx("quiver").then(object => {
                object.children = [object.children[0], object.children[1]];
                object.scale.set(15, 15, 15);
                object.position.z = -12.5;
                instance.enemy.traverse(child => {
                    if (child.name === "mixamorig8Spine") {
                        child.add(object);
                    }
                });
            })
            instance.third.add.existing(instance.enemy);
            instance.third.physics.add.existing(instance.enemy, { shape: 'box', ignoreScale: true, offset: { y: -0.5 } });
            objects.push(instance.enemy);
            instance.enemy.loaded = true;
            const animsToLoad = ["running", "slashing", "shoot", "death", "celebrate"];
            (async() => {
                loading.innerHTML = `Loading Enemy Animations (0/${animsToLoad.length})...`;
                for (const anim of animsToLoad) {
                    loading.innerHTML = `Loading Enemy Animations (${animsToLoad.indexOf(anim)}/${animsToLoad.length})...`;
                    const animText = await fetch(`./assets/enemies/rangedEnemy/animations/warrior-${anim}.json`);
                    const animJson = await animText.json();
                    const a = THREE.AnimationClip.parse(animJson);
                    instance.enemy.animation.add(anim[0].toUpperCase() + anim.slice(1).toLowerCase(), a);
                }
                instance.enemyAI = new RangedEnemyAI(instance.enemy);
                loading.innerHTML = `Loaded!`;
                setTimeout(() => {
                    loading.innerHTML = "";
                })
            })();
        });
    }
}