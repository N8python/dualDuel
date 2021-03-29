class JetpackEnemyAI extends EnemyAI {
    constructor(enemy) {
        super(enemy, 150);
        this.enemy.animation.play('Idle');
        this.enemy.cooldown = 0;
        this.enemy.aggro = false;
        this.enemy.aggroState = "none";
        this.enemy.shootTick = 0;
        soundManager.jetpack.setVolume(0.6 * localProxy.sfxVolume);
        soundManager.jetpack.loop();
    }
    update(target, ground) {
        const futurePos = futurePlayerPos(this.enemy.position.distanceTo(player.position) / 20);
        super.update(target, ground);
        this.stayUp(1);
        if (this.enemy.health === 0) {
            if (!this.enemy.dead) {
                soundManager.jetpack.stop();
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
        this.enemy.body.setVelocityY(this.enemy.body.velocity.y * 0.9 + (1 - this.enemy.position.y) * 0.5 + 0.1 * Math.sin(performance.now() / 200));
        mainScene.jetpack.emitters[0].position.x = this.enemy.position.x - 0.25 * Math.sin(this.enemy.body.rotation.y);
        mainScene.jetpack.emitters[0].position.y = this.enemy.position.y + 0.5;
        mainScene.jetpack.emitters[0].position.z = this.enemy.position.z - 0.25 * Math.cos(this.enemy.body.rotation.y);
        mainScene.jetpack.emitters[0].currentEmitTime = 0;
        if ((this.enemy.position.distanceTo(target.position) < 9 || this.enemy.health < this.enemy.maxHealth || this.enemy.aggro) && !this.enemy.attacking && target.health > 0) {
            if (!this.enemy.aggro) {
                this.enemy.aggroState = "pursue";
            }
            this.enemy.aggro = true;
            //this.stayUp(1);
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
            } else if (this.enemy.aggroState === "shoot") {
                this.enemy.shootTick++;
                if (this.enemy.shootTick % 10 === 0) {
                    soundManager.blaster.setVolume(soundManager.random(0.1, 0.15) * localProxy.sfxVolume);
                    soundManager.blaster.rate(soundManager.random(0.75, 1.25));
                    soundManager.blaster.play();
                    projectiles.push(new Arrow({
                        scene: mainScene,
                        model: mainScene.enemy.arrowModel,
                        x: this.enemy.position.x + 1 * Math.sin(this.enemy.body.rotation.y),
                        y: this.enemy.position.y + 0.9,
                        z: this.enemy.position.z + 1 * Math.cos(this.enemy.body.rotation.y),
                        angle: this.enemy.body.rotation.y,
                        target: player,
                        pool: false,
                        speed: 20,
                        bullet: true,
                        laser: true
                    }));
                }
                this.rotateTowards(futurePos.x, futurePos.z, 8);
                //this.stayUp(1);
                if (this.enemy.position.distanceTo(player.position) < 5) {
                    this.moveYDir(-0.1);
                }
                if (this.enemy.position.distanceTo(player.position) > 7.5) {
                    this.enemy.animation.play("Idle");
                    this.enemy.aggroState = "pursue";
                }
                if (this.enemy.position.distanceTo(player.position) < 2.5) {
                    this.enemy.animation.play("Idle");
                    this.enemy.aggroState = "flee";
                }
            } else if (this.enemy.aggroState === "flee") {
                this.rotateTowards(-(player.position.x - this.enemy.position.x), -(player.position.z - this.enemy.position.z));
                this.moveYDir(0.35);
                //this.stayUp(1);
                if (this.enemy.position.distanceTo(player.position) > 3.5 || Math.random() < 0.02) {
                    this.enemy.animation.play("Shoot");
                    this.enemy.aggroState = "shoot";
                }
            }
        }
        if (Math.abs(target.position.y - this.enemy.position.y) > 8 || target.health === 0) {
            soundManager.jetpack.stop();
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
        instance.third.load.fbx('jetpack-enemy').then(object => {
            instance.enemy.add(object);
            instance.enemy.position.set(0, 1, 5);
            instance.enemy.scale.set(0.0075, 0.0075, 0.0075);
            instance.third.animationMixers.add(instance.enemy.animation.mixer);
            instance.enemy.animation.add('Idle', object.animations[0]);
            let added = false;
            instance.third.load.fbx("jetpack-jetpack").then(object => {
                object.scale.set(30, 30, 30);
                object.position.z = -30;
                object.position.x = 7.5;
                // object.scale.set(0.03, 0.03, 0.03);
                //instance.third.add.existing(object);
                instance.enemy.traverse(child => {
                    if (child.name === 'Spine' && !added) {
                        added = true;
                        //console.log("YAY")
                        //this.third.add.box({ width: 20, height: 20, depth: 20 })
                        child.add(object);
                    }
                })
            });
            let amt = 0;
            instance.third.load.fbx("jetpack-rifle").then(object => {
                object.scale.set(0.25, 0.25, 0.25);
                object.rotation.z = Math.PI;
                object.rotation.x = 3 * Math.PI / 2;
                object.position.z = 10;
                object.rotation.y = -0.25;
                /*object.position.x = -40;
                object.position.y = -20;
                object.position.z = 18;
                object.rotation.y = Math.PI / 2;*/
                instance.enemy.traverse(child => {
                    if (child.name === "RightHand") {
                        amt++;
                    }
                    if (child.name === 'RightHand' && amt === 4) {
                        //console.log("YAY")
                        //this.third.add.box({ width: 20, height: 20, depth: 20 })
                        child.add(object);
                    }
                })
            });
            instance.third.load.fbx("laser").then(object => {
                object.scale.set(0.05, 0.05, 0.05);
                instance.enemy.arrowModel = object;
            });
            /*instance.third.load.fbx(`./assets/enemies/jetpackEnemy/Ymca Dance.fbx`).then(object => {
                console.log(JSON.stringify(object.animations[0]));
            });*/
            instance.third.add.existing(instance.enemy);
            instance.third.physics.add.existing(instance.enemy, { shape: 'box', ignoreScale: true, offset: { y: -0.5 } });
            objects.push(instance.enemy);
            instance.enemy.loaded = true;
            const animsToLoad = ["shoot", "death", "celebrate"]; //["running", "slashing", "death", "celebrate"];
            (async() => {
                loading.innerHTML = `Loading Enemy Animations (0/${animsToLoad.length})...`;
                for (const anim of animsToLoad) {
                    loading.innerHTML = `Loading Enemy Animations (${animsToLoad.indexOf(anim)}/${animsToLoad.length})...`;
                    const animText = await fetch(`./assets/enemies/jetpackEnemy/animations/warrior-${anim}.json`);
                    const animJson = await animText.json();
                    instance.enemy.animation.add(anim[0].toUpperCase() + anim.slice(1).toLowerCase(), THREE.AnimationClip.parse(animJson));
                }
                instance.enemyAI = new JetpackEnemyAI(instance.enemy);
                loading.innerHTML = `Loaded!`;
                setTimeout(() => {
                    loading.innerHTML = "";
                })
            })();
        });
    }
}