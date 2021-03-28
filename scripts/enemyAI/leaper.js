class LeaperEnemyAI extends EnemyAI {
    constructor(enemy) {
        super(enemy, 225);
        this.enemy.animation.play('Idle');
        this.enemy.aggro = false;
        this.enemy.aggroState = "none";
        this.enemy.attackTick = 0;
        this.enemy.specialCooldown = 300;
        this.enemy.throwCooldown = 300;
        this.enemy.tc = 0;
        this.enemy.animation.mixer.addEventListener("loop", e => {
            if (e.action.getClip().isAttack && this.enemy && this.enemy.body) {
                if (this.enemy.aggroState === "attack") {
                    this.enemy.attackTick = 0;
                    this.enemy.animation.play("Running");
                    this.enemy.aggroState = "pursue";
                } else if (this.enemy.aggroState === "smash") {
                    this.enemy.attackTick = 0;
                    this.enemy.specialCooldown = 360;
                    this.enemy.animation.play("Running");
                    this.enemy.aggroState = "pursue";
                } else if (this.enemy.aggroState === "throw") {
                    this.enemy.attackTick = 0;
                    this.enemy.throwCooldown = 360;
                    this.enemy.animation.play("Running");
                    this.enemy.aggroState = "pursue";
                }
            }
        });
    }
    update(target, ground) {
        this.enemy.specialCooldown--;
        this.enemy.throwCooldown--;
        this.enemy.tc--;
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
        if ((this.enemy.position.distanceTo(target.position) < 7.5 || this.enemy.health < this.enemy.maxHealth || this.enemy.aggro) && target.health > 0) {
            if (!this.enemy.aggro) {
                this.enemy.animation.play("Running");
                this.enemy.aggroState = "pursue";
            }
            this.enemy.aggro = true;
            if (this.enemy.aggroState === "pursue") {
                this.rotateTowards(player.position.x, player.position.z);
                this.moveYDir(0.2);
                if (this.enemy.position.distanceTo(player.position) < 7.5 && this.enemy.mainHammer.visible && this.enemy.throwCooldown < 0) {
                    soundManager.slashLong.setVolume(soundManager.random(0.4, 0.6) * localProxy.sfxVolume);
                    soundManager.slashLong.rate(soundManager.random(0.75, 1.25));
                    soundManager.slashLong.play();
                    this.enemy.animation.play("Throw");
                    //this.enemy.body.setVelocityY(this.enemy.body.velocity.y + 4);
                    //this.moveYDir(3);
                    this.enemy.aggroState = "throw";
                    this.enemy.animation.mixer._actions.forEach(x => {
                        if (x.getClip().duration === 3.299999952316284) {
                            x.setEffectiveTimeScale(2.5);
                        }
                    });
                }
                if (this.enemy.position.distanceTo(player.position) < 5 && this.enemy.mainHammer.visible && this.enemy.specialCooldown < 0) {
                    soundManager.slashLong.setVolume(soundManager.random(0.4, 0.6) * localProxy.sfxVolume);
                    soundManager.slashLong.rate(soundManager.random(0.5, 0.75));
                    soundManager.slashLong.play();
                    this.enemy.animation.play("Smash");
                    this.enemy.body.setVelocityY(this.enemy.body.velocity.y + 4);
                    this.moveYDir(3);
                    this.enemy.aggroState = "smash";
                }
                if (this.enemy.position.distanceTo(player.position) < 3.5 && this.enemy.mainHammer.visible) {
                    soundManager.slashLong.setVolume(soundManager.random(0.4, 0.6) * localProxy.sfxVolume);
                    soundManager.slashLong.rate(soundManager.random(0.75, 1.25));
                    soundManager.slashLong.play();
                    this.enemy.animation.play("Slashing");
                    this.enemy.aggroState = "attack";
                }
            } else if (this.enemy.aggroState === "attack") {
                this.rotateTowards(player.position.x, player.position.z);
                this.enemy.attackTick++;
                if (this.enemy.attackTick === 30) {
                    if (this.enemy.position.distanceTo(player.position) < 3.5) {
                        if (blocking && cooldown < 10) {
                            targetCooldown = 100;
                        } else {
                            player.body.setVelocity(player.body.velocity.x + 7.5 * Math.sin(this.enemy.body.rotation.y), player.body.velocity.y + 5, player.body.velocity.z + 7.5 * Math.cos(this.enemy.body.rotation.y));
                            if (target.health) {
                                playerTakeDamage(Math.floor(Math.random() * 7 + 7), "melee");
                            }
                        }
                    }
                }
            } else if (this.enemy.aggroState === "smash") {
                this.rotateTowards(player.position.x, player.position.z);
                this.enemy.attackTick++;
                if (this.enemy.attackTick === 30) {
                    if (this.enemy.position.distanceTo(player.position) < 3.5) {
                        if (blocking && cooldown < 10) {
                            targetCooldown = 100;
                        } else {
                            player.body.setVelocity(player.body.velocity.x + 9 * Math.sin(this.enemy.body.rotation.y), player.body.velocity.y + 10, player.body.velocity.z + 9 * Math.cos(this.enemy.body.rotation.y));
                            if (player.health) {
                                playerTakeDamage(Math.floor(Math.random() * 14 + 14), "melee");
                            }
                        }
                    }
                }
            } else if (this.enemy.aggroState === "throw") {
                this.rotateTowards(player.position.x, player.position.z);
                this.enemy.attackTick++;
                if (this.enemy.attackTick === 60) {
                    this.enemy.tc = 30;
                    this.enemy.mainHammer.visible = false;
                    projectiles.push(new Rang({
                        scene: mainScene,
                        model: this.enemy.hammer,
                        x: this.enemy.position.x + 1 * Math.sin(this.enemy.body.rotation.y),
                        y: this.enemy.position.y + 0.75,
                        z: this.enemy.position.z + 1 * Math.cos(this.enemy.body.rotation.y),
                        xVel: 8 * Math.sin(this.enemy.body.rotation.y),
                        yVel: 0.4 + this.enemy.position.distanceTo(player.position) * 0.3,
                        zVel: 8 * Math.cos(this.enemy.body.rotation.y),
                        fromEnemy: true
                    }));
                }
            }
        }
        if (target.health === 0) {
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
        projectiles.forEach(projectile => {
            if (projectile instanceof Rang && projectile.fromEnemy && this.enemy.tc < 0) {
                if (projectile.rang.position.distanceTo(this.enemy.position) < 1) {
                    /*this.thrown = false;
                    mainScene.sword.rang.visible = true;
                    projectile.rang.visible = false;*/
                    this.enemy.mainHammer.visible = true;
                    objects.splice(objects.indexOf(projectile.rang), 1);
                    projectiles.splice(projectiles.indexOf(projectile), 1);
                    mainScene.third.physics.destroy(projectile.rang);
                    mainScene.third.scene.children.splice(mainScene.third.scene.children.indexOf(projectile.rang), 1);
                } else if ((projectile.rang.position.y + 3 < this.enemy.position.y && projectile.rang.position.y < 0) || projectile.rang.tick > 300) {
                    /*this.thrown = false;
                    mainScene.sword.rang.visible = true;
                    projectile.rang.visible = false;*/
                    this.enemy.mainHammer.visible = true;
                    objects.splice(objects.indexOf(projectile.rang), 1);
                    projectiles.splice(projectiles.indexOf(projectile), 1);
                    mainScene.third.physics.destroy(projectile.rang);
                    mainScene.third.scene.children.splice(mainScene.third.scene.children.indexOf(projectile.rang), 1);
                }
            }
        });
    }
    static loadEnemy(instance) {
        instance.enemy = new ExtendedObject3D();
        instance.third.load.fbx('leaper-enemy').then(object => {
            //object.scale.set(0.0075, 0.0075, 0.0075);
            instance.enemy.add(object);
            instance.enemy.position.set(0, 1, 5);
            instance.enemy.scale.set(0.0075, 0.0075, 0.0075);
            instance.third.animationMixers.add(instance.enemy.animation.mixer);
            instance.enemy.animation.add('Idle', object.animations[1]);
            instance.third.load.fbx("leaper-hammer").then(object => {
                instance.enemy.hammer = object.clone();
                object.scale.set(25, 25, 25);
                object.position.x = 7.5;
                instance.enemy.traverse(child => {
                    if (child.name === 'mixamorigRightHand') {
                        // alert("YAY")
                        //console.log("YAY")
                        //this.third.add.box({ width: 20, height: 20, depth: 20 })
                        child.add(object);
                        instance.enemy.mainHammer = object;
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
            /*instance.third.load.fbx(`assets/enemies/leaperEnemy/Frisbee Throw.fbx`).then(object => {
                console.log(JSON.stringify(object.animations[0]));
            });*/
            const animsToLoad = ["running", "slashing", "death", "celebrate", "smash", "throw"];
            const attacks = ["slashing", "smash", "throw"];
            (async() => {
                loading.innerHTML = `Loading Enemy Animations (0/${animsToLoad.length})...`;
                for (const anim of animsToLoad) {
                    loading.innerHTML = `Loading Enemy Animations (${animsToLoad.indexOf(anim)}/${animsToLoad.length})...`;
                    const animText = await fetch(`./assets/enemies/leaperEnemy/animations/warrior-${anim}.json`);
                    const animJson = await animText.json();
                    const animClip = THREE.AnimationClip.parse(animJson);
                    if (attacks.includes(anim)) {
                        animClip.isAttack = true;
                    }
                    instance.enemy.animation.add(anim[0].toUpperCase() + anim.slice(1).toLowerCase(), animClip);
                }
                instance.enemyAI = new LeaperEnemyAI(instance.enemy);
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