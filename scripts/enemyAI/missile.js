class MissileEnemyAI extends EnemyAI {
    constructor(enemy) {
        super(enemy, 200);
        this.enemy.animation.play('Idle');
        this.enemy.cooldown = 0;
        this.enemy.aggro = false;
        this.enemy.aggroState = "none";
        this.enemy.shootTick = 0;
        this.enemy.attackTick = 0;
        this.enemy.missileTick = 0;
        this.enemy.isMissile = true;
        /*this.enemy.animation.mixer.addEventListener("loop", e => {
            if (e.action.getClip().isAttack && this.enemy && this.enemy.body) {
                if (this.enemy.aggroState === "attack") {
                    this.enemy.attackTick = 0;
                    this.enemy.animation.play("Running");
                    this.enemy.aggroState = "pursue";
                }
            }
        });*/
    }
    update(target, ground) {
        const futurePos = futurePlayerPos(this.enemy.position.distanceTo(player.position) / 15);
        //console.log(this.enemy.body.position);
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
        if ((this.enemy.position.distanceTo(target.position) < 9 || this.enemy.health < this.enemy.maxHealth || this.enemy.aggro) && target.health > 0) {
            if (!this.enemy.aggro) {
                this.enemy.animation.play("Running");
                this.enemy.aggroState = "pursue";
            }
            this.enemy.aggro = true;
            if (this.enemy.aggroState === "pursue") {
                if (this.enemy.aggroState === "pursue") {
                    if (this.enemy.position.distanceTo(player.position) > 7.5) {
                        this.rotateTowards(futurePos.x, futurePos.z, 8);
                        this.moveYDir(0.25);
                        // this.stayUp(1);
                    } else {
                        this.rotateTowards(futurePos.x, futurePos.z, 8);
                        // this.stayUp(1);
                        this.enemy.animation.play("Shoot");
                        this.enemy.aggroState = "shoot";
                    }
                }
            } else if (this.enemy.aggroState === "shoot") {
                this.enemy.missileTick++;
                if (this.enemy.missileTick === 90) {
                    this.enemy.launcher.children[1].visible = true;
                }
                if (this.enemy.missileTick === 180) {
                    soundManager.missileLaunch.setVolume(localProxy.sfxVolume);
                    soundManager.missileLaunch.play();
                    this.enemy.missileTick = 0;
                    projectiles.push(new Dynamite({
                        scene: mainScene,
                        model: this.enemy.launcher.children[1].clone(),
                        x: this.enemy.position.x + Math.sin(this.enemy.body.rotation.y),
                        y: this.enemy.position.y + 0.85,
                        z: this.enemy.position.z + Math.cos(this.enemy.body.rotation.y),
                        xVel: 3.5 * Math.sin(this.enemy.body.rotation.y),
                        yVel: 0,
                        zVel: 3.5 * Math.cos(this.enemy.body.rotation.y),
                        antigravity: true,
                        homing: true
                    }));
                    this.enemy.launcher.children[1].visible = false;
                }
                this.enemy.shootTick++;
                if (this.enemy.shootTick % 12 === 0) {
                    if (this.enemy.position.distanceTo(player.position) < 3 && Math.random() < 0.075) {
                        this.enemy.animation.play("Smash");
                        this.enemy.aggroState = "attack";
                    } else {
                        soundManager.machineGun.setVolume(soundManager.random(0.3, 0.6) * localProxy.sfxVolume);
                        soundManager.machineGun.rate(soundManager.random(0.6, 0.9));
                        soundManager.machineGun.play();
                        projectiles.push(new Arrow({
                            scene: mainScene,
                            model: mainScene.enemy.arrowModel,
                            x: this.enemy.position.x + 1 * Math.sin(this.enemy.body.rotation.y),
                            y: this.enemy.position.y + 1.1,
                            z: this.enemy.position.z + 1 * Math.cos(this.enemy.body.rotation.y),
                            angle: this.enemy.body.rotation.y,
                            target: player,
                            pool: false,
                            speed: 15,
                            bullet: true,
                            laser: true
                        }));
                    }
                }
                this.rotateTowards(futurePos.x, futurePos.z, 8);
                if (this.enemy.position.distanceTo(player.position) > 7.5) {
                    this.enemy.animation.play("Running");
                    this.enemy.aggroState = "pursue";
                }
            } else if (this.enemy.aggroState === "attack") {
                this.enemy.attackTick++;
                if (this.enemy.attackTick === 60) {
                    if (this.enemy.position.distanceTo(player.position) < 3.5) {
                        if (blocking && cooldown < 10) {
                            targetCooldown = 100;
                        } else {
                            player.body.setVelocity(player.body.velocity.x + 4 * Math.sin(this.enemy.body.rotation.y), player.body.velocity.y + 5, player.body.velocity.z + 4 * Math.cos(this.enemy.body.rotation.y));
                            if (player.health) {
                                playerTakeDamage(Math.floor(Math.random() * 7 + 7), "melee");
                            }
                        }
                    }
                } else if (this.enemy.attackTick === 100) {
                    this.enemy.attackTick = 0;
                    this.enemy.animation.play("Running");
                    this.enemy.aggroState = "pursue";
                }
                this.rotateTowards(futurePos.x, futurePos.z, 8);
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
            this.enemy.aggroState = "none";
        }
    }
    static loadEnemy(instance) {
        instance.enemy = new ExtendedObject3D();
        instance.third.load.fbx('missile-enemy').then(object => {
            //object.scale.set(0.0075, 0.0075, 0.0075);
            instance.enemy.add(object);
            instance.enemy.position.set(0, 1, 5);
            instance.enemy.scale.set(0.0075, 0.0075, 0.0075);
            instance.third.animationMixers.add(instance.enemy.animation.mixer);
            instance.enemy.animation.add('Idle', object.animations[0]);
            instance.third.load.fbx("missile-launcher").then(object => {
                object.scale.set(30, 30, 30);
                object.position.z = -25;
                object.position.y = 7.5;
                //this.third.add.existing(object);
                let added = false;
                instance.enemy.traverse(child => {
                    if (child.name === 'mixamorigSpine' && !added) {
                        added = true;
                        //console.log("YAY")
                        //this.third.add.box({ width: 20, height: 20, depth: 20 })
                        child.add(object);
                        instance.enemy.launcher = object;
                        instance.enemy.launcher.children[1].visible = false;
                    }
                })
            });
            instance.third.load.fbx("missile-rifle").then(object => {
                object.scale.set(10, 10, 10);
                object.rotation.y = 3 * Math.PI / 2 + Math.PI / 8;
                object.rotation.x = Math.PI / 2;
                //object.rotation.z = Math.PI / 8;
                let added = false;
                instance.enemy.traverse(child => {
                    if (child.name === 'mixamorigRightHand' && !added) {
                        added = true;
                        //console.log("YAY")
                        //this.third.add.box({ width: 20, height: 20, depth: 20 })
                        child.add(object);
                    }
                })
            });
            instance.third.load.fbx("lead-bullet").then(object => {
                object.rotation.y = 3 * Math.PI / 2;
                object.scale.set(0.02, 0.02, 0.02);
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
            /*instance.third.load.fbx(`./assets/enemies/missileEnemy/Wave Hip Hop Dance (1).fbx`).then(object => {
                console.log(JSON.stringify(object.animations[0]));
            });*/
            const animsToLoad = ["running", "shoot", "smash", "celebrate", "death"]; //["running", "slashing", "death", "celebrate"];
            const attacks = ["smash"];
            (async() => {
                loading.innerHTML = `Loading Enemy Animations (0/${animsToLoad.length})...`;
                for (const anim of animsToLoad) {
                    loading.innerHTML = `Loading Enemy Animations (${animsToLoad.indexOf(anim)}/${animsToLoad.length})...`;
                    const animText = await fetch(`./assets/enemies/missileEnemy/animations/warrior-${anim}.json`);
                    const animJson = await animText.json();
                    const animClip = THREE.AnimationClip.parse(animJson);
                    if (attacks.includes(anim)) {
                        animClip.isAttack = true;
                    }
                    instance.enemy.animation.add(anim[0].toUpperCase() + anim.slice(1).toLowerCase(), animClip);
                }
                instance.enemyAI = new MissileEnemyAI(instance.enemy);
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