class WizardEnemyAI extends EnemyAI {
    constructor(enemy) {
        super(enemy, 150);
        this.enemy.animation.play('Idle');
        this.enemy.aggro = false;
        this.enemy.aggroState = "none";
        this.enemy.isWizard = true;
        this.enemy.spellSlots = 5;
        this.enemy.spellTick = 0;
        let iceCounter = 0;
        this.enemy.animation.mixer.addEventListener("loop", e => {
            if (e.action.getClip().isSpell && this.enemy && this.enemy.body && gameOverMessage.innerHTML === "") {
                if (this.enemy.aggroState === "ice") {
                    iceCounter++;
                    if (iceCounter === 2) {
                        this.enemy.spellTick = 0;
                        iceCounter = 0;
                        this.enemy.spellSlots--;
                        this.enemy.animation.play("Running");
                        this.enemy.aggroState = "pursue";
                    }
                } else if (this.enemy.aggroState === "fire") {
                    this.enemy.spellTick = 0;
                    this.enemy.spellSlots--;
                    this.enemy.animation.play("Running");
                    this.enemy.aggroState = "pursue";
                } else if (this.enemy.aggroState === "air") {
                    this.enemy.spellTick = 0;
                    this.enemy.spellSlots--;
                    this.enemy.animation.play("Running");
                    this.enemy.aggroState = "pursue";
                } else if (this.enemy.aggroState === "block") {
                    this.enemy.spellTick = 0;
                    this.enemy.spellSlots = 5;
                    this.enemy.animation.play("Running");
                    this.enemy.aggroState = "pursue";
                }
            }
        });
    }
    update(target, ground) {
        //console.log(this.enemy.body.position);
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
                if (this.enemy.position.distanceTo(player.position) < 5 && this.enemy.spellSlots > 3) {
                    this.enemy.animation.play("Ice");
                    this.enemy.aggroState = "ice";
                    this.enemy.witchHat.children[1].material = new THREE.MeshPhongMaterial({ color: 0x00ffff });
                    setTimeout(() => {
                        this.enemy.witchHat.children[1].material = this.enemy.witchHat.mainMaterial;
                    }, 500)
                } else if (this.enemy.position.distanceTo(player.position) < 4 && this.enemy.spellSlots > 2) {
                    this.enemy.animation.play("Fire");
                    this.enemy.aggroState = "fire";
                    this.enemy.witchHat.children[1].material = new THREE.MeshPhongMaterial({ color: 0xff9900 });
                    setTimeout(() => {
                        this.enemy.witchHat.children[1].material = this.enemy.witchHat.mainMaterial;
                    }, 500)
                } else if (this.enemy.position.distanceTo(player.position) < 4 && this.enemy.spellSlots > 1) {
                    this.enemy.animation.play("Fire");
                    this.enemy.aggroState = "air";
                    this.enemy.witchHat.children[1].material = new THREE.MeshPhongMaterial({ color: 0x999999 });
                    setTimeout(() => {
                        this.enemy.witchHat.children[1].material = this.enemy.witchHat.mainMaterial;
                    }, 500)
                } else if (this.enemy.position.distanceTo(player.position) < 3 && this.enemy.spellSlots === 1) {
                    this.enemy.animation.play("Block");
                    this.enemy.aggroState = "block";
                    this.enemy.witchHat.children[1].material = new THREE.MeshPhongMaterial({ color: 0xff00cc });
                    setTimeout(() => {
                        this.enemy.witchHat.children[1].material = this.enemy.witchHat.mainMaterial;
                    }, 500)
                }
            } else if (this.enemy.aggroState === "ice") {
                this.enemy.spellTick++;
                if (this.enemy.spellTick === 70) {
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
                this.rotateTowards(player.position.x, player.position.z);
            } else if (this.enemy.aggroState === "fire") {
                this.enemy.spellTick++;
                this.rotateTowards(player.position.x, player.position.z);
                if (this.enemy.spellTick === 60) {
                    soundManager.fire.setVolume(soundManager.random(0.4, 0.6) * localProxy.sfxVolume);
                    soundManager.fire.rate(soundManager.random(0.75, 1.25));
                    soundManager.fire.play();
                    setTimeout(() => {
                        soundManager.fire.stop();
                    }, 1000);
                    const offsets = [{ x: 0.5, z: 0 }, { x: -0.5, z: 0 }, { x: 0, z: 0.5 }, { x: 0, z: -0.5 }, { x: 0, z: 0 }];
                    const mag = Math.random() * 2 + 1
                    mainScene.fire.emitters.forEach((emitter, i) => {
                        emitter.position.x = this.enemy.position.x + Math.min(player.position.distanceTo(this.enemy.position), 4) * Math.sin(this.enemy.body.rotation.y) + offsets[i].x;
                        emitter.position.y = this.enemy.position.y;
                        emitter.position.z = this.enemy.position.z + Math.min(player.position.distanceTo(this.enemy.position), 4) * Math.cos(this.enemy.body.rotation.y) + offsets[i].z;
                        emitter.currentEmitTime = 0;
                    });
                    setTimeout(() => {
                        dealExplodeDamage(mainScene.fire.emitters[4].position, 25, 1.5);
                    }, 500)
                    player.fire = 240 - 60 * new THREE.Vector3(mainScene.fire.emitters[4].position.x, mainScene.fire.emitters[4].position.y, mainScene.fire.emitters[4].position.z).distanceTo(player.position);
                }
            } else if (this.enemy.aggroState === "air") {
                this.enemy.spellTick++;
                this.rotateTowards(player.position.x, player.position.z);
                if (this.enemy.spellTick === 60) {
                    soundManager.wind.setVolume(soundManager.random(0.75, 1.25) * localProxy.sfxVolume);
                    soundManager.wind.rate(soundManager.random(0.75, 1.25));
                    soundManager.wind.play();
                    const offsets = [{ x: 0.5, z: 0 }, { x: 0.5, z: 0.5 }, { x: -0.5, z: 0 }, { x: -0.5, z: -0.5 }, { x: 0, z: 0.5 }, { x: -0.5, z: 0.5 }, { x: 0, z: -0.5 }, { x: 0.5, z: -0.5 }, { x: 0, z: 0 }];
                    mainScene.air.emitters.forEach((emitter, i) => {
                        emitter.position.x = this.enemy.position.x + Math.min(player.position.distanceTo(this.enemy.position), 5) * Math.sin(this.enemy.body.rotation.y) + offsets[i].x;
                        emitter.position.y = this.enemy.position.y;
                        emitter.position.z = this.enemy.position.z + Math.min(player.position.distanceTo(this.enemy.position), 5) * Math.cos(this.enemy.body.rotation.y) + offsets[i].z;
                        emitter.currentEmitTime = 0;
                    });
                    player.body.setVelocityY(player.body.velocity.y + Math.max(12.5 - 3 * new THREE.Vector3(mainScene.air.emitters[8].position.x, mainScene.air.emitters[8].position.y, mainScene.air.emitters[8].position.z).distanceTo(player.position), 0));
                    dealExplodeDamage(mainScene.air.emitters[8].position, 15, 1);
                }
            } else if (this.enemy.aggroState === "block") {
                this.enemy.spellTick++;
                this.rotateTowards(player.position.x, player.position.z);
                if (this.enemy.spellTick === 21) {
                    soundManager.shield.setVolume(soundManager.random(1.75, 2.25) * localProxy.sfxVolume);
                    soundManager.shield.rate(soundManager.random(0.75, 1.25));
                    soundManager.shield.play();
                    player.body.setVelocityX(player.body.velocity.x + Math.max(10 - 1 * new THREE.Vector3(mainScene.shield.emitters[0].position.x, mainScene.shield.emitters[0].position.y, mainScene.shield.emitters[0].position.z).distanceTo(player.position), 0) * Math.sin(this.enemy.body.rotation.y));
                    player.body.setVelocityZ(player.body.velocity.z + Math.max(10 - 1 * new THREE.Vector3(mainScene.shield.emitters[0].position.x, mainScene.shield.emitters[0].position.y, mainScene.shield.emitters[0].position.z).distanceTo(player.position), 0) * Math.cos(this.enemy.body.rotation.y));
                    mainScene.shield.emitters.forEach((emitter, i) => {
                        emitter.currentEmitTime = 0;
                    });
                    if (this.enemy.health > 0) {
                        this.enemy.health += 12.5;
                    }
                    this.enemy.health = Math.min(this.enemy.health, this.enemy.maxHealth);
                    dealExplodeDamage(mainScene.shield.emitters[0].position, 10, 1);
                }
                if (this.enemy.spellTick >= 20) {
                    mainScene.shield.emitters.forEach((emitter, i) => {
                        emitter.position.x = this.enemy.position.x + 1.5 * Math.sin(this.enemy.body.rotation.y);
                        emitter.position.y = this.enemy.position.y + (i == 0 ? 0.25 : 0) + 0.5;
                        emitter.position.z = this.enemy.position.z + 1.5 * Math.cos(this.enemy.body.rotation.y);
                    });
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
    }
    static loadEnemy(instance) {
        instance.enemy = new ExtendedObject3D();
        instance.third.load.fbx('wizard-enemy').then(object => {
            //object.scale.set(0.0075, 0.0075, 0.0075);
            instance.enemy.add(object);
            instance.enemy.position.set(0, 1, 5);
            instance.enemy.scale.set(0.0075, 0.0075, 0.0075);
            instance.third.animationMixers.add(instance.enemy.animation.mixer);
            instance.enemy.animation.add('Idle', object.animations[0]);
            instance.third.load.fbx("wizard-hat").then(object => {
                object.scale.set(0.15, 0.15, 0.15);
                object.position.y = 12.5;
                /*object.scale.set(30, 30, 30);
                object.position.z = -30;
                object.position.x = 7.5;*/
                // object.scale.set(0.03, 0.03, 0.03);
                //instance.third.add.existing(object);
                instance.enemy.traverse(child => {
                    if (child.name === "mixamorigHead") {
                        child.add(object);
                    }
                })
                instance.enemy.witchHat = object;
                instance.enemy.witchHat.mainMaterial = object.children[1].material;
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
            const animsToLoad = ["block", "celebrate", "death", "fire", "ice", "running"];
            const spells = ["block", "fire", "ice"];
            (async() => {
                loading.innerHTML = `Loading Enemy Animations (0/${animsToLoad.length})...`;
                for (const anim of animsToLoad) {
                    loading.innerHTML = `Loading Enemy Animations (${animsToLoad.indexOf(anim)}/${animsToLoad.length})...`;
                    const animText = await fetch(`./assets/enemies/wizardEnemy/animations/warrior-${anim}.json`);
                    const animJson = await animText.json();
                    const animClip = THREE.AnimationClip.parse(animJson);
                    if (spells.includes(anim)) {
                        animClip.isSpell = true;
                    }
                    instance.enemy.animation.add(anim[0].toUpperCase() + anim.slice(1).toLowerCase(), animClip);
                }
                instance.enemyAI = new WizardEnemyAI(instance.enemy);
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