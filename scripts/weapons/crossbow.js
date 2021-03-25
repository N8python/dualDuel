class Crossbow extends Weapon {
    constructor() {
        super({
            minDamage: 3,
            maxDamage: 8
        });
        this.charge = 0;
        this.currAmmo = "none";
    }
    primaryAttack() {
        if (this.charge < 1) {
            if (cooldown < 10 && targetZDepth === 0 && targetCooldown === 0) {
                targetZDepth = 1.25;
                targetCooldown = 20;
                this.handleSwing({
                    rightBound: Math.PI / 6,
                    leftBound: -Math.PI / 6,
                    verticalKnockback: 1.5
                });
            }
        } else {
            if (this.charge > 60) {
                if (this.currAmmo === "arrow") {
                    const raycaster = new THREE.Raycaster()
                    const x = 0
                    const y = 0
                    const force = 10;
                    const pos = new THREE.Vector3()

                    raycaster.setFromCamera({ x, y }, mainScene.third.camera)

                    pos.copy(raycaster.ray.direction)
                    pos.add(raycaster.ray.origin)

                    //const sphere = mainScene.third.physics.add.sphere({ radius: 0.05, x: pos.x, y: pos.y, z: pos.z, mass: 5, bufferGeometry: true }, { phong: { color: 0x202020 } })
                    const xPos = pos.x;
                    const yPos = pos.y;
                    const zPos = pos.z;
                    pos.copy(raycaster.ray.direction);
                    pos.multiplyScalar(3);
                    mainScene.third.load.fbx("arrow").then(model => {
                        soundManager.bowShoot.setVolume(soundManager.random(1.25, 1.5) * localProxy.sfxVolume);
                        soundManager.bowShoot.rate(soundManager.random(0.75, 1.25));
                        soundManager.bowShoot.play();
                        projectiles.push(new Arrow({
                            scene: mainScene,
                            model,
                            x: xPos,
                            y: yPos,
                            z: zPos,
                            xVel: pos.x * force,
                            yVel: pos.y * force,
                            zVel: pos.z * force,
                            target: mainScene.enemy,
                            pool: false
                        }));
                    });
                } else if (this.currAmmo === "dynamite") {
                    const raycaster = new THREE.Raycaster()
                    const x = 0
                    const y = 0
                    const force = 8;
                    const pos = new THREE.Vector3()

                    raycaster.setFromCamera({ x, y }, mainScene.third.camera)

                    pos.copy(raycaster.ray.direction)
                    pos.add(raycaster.ray.origin)

                    //const sphere = mainScene.third.physics.add.sphere({ radius: 0.05, x: pos.x, y: pos.y, z: pos.z, mass: 5, bufferGeometry: true }, { phong: { color: 0x202020 } })
                    const xPos = pos.x;
                    const yPos = pos.y;
                    const zPos = pos.z;
                    pos.copy(raycaster.ray.direction);
                    pos.multiplyScalar(3);
                    mainScene.third.load.fbx("bomber-dynamite").then(model => {
                        soundManager.bowShoot.setVolume(soundManager.random(1.25, 1.5) * localProxy.sfxVolume);
                        soundManager.bowShoot.rate(soundManager.random(0.75, 1.25));
                        soundManager.bowShoot.play();
                        projectiles.push(new Dynamite({
                            scene: mainScene,
                            model,
                            x: xPos,
                            y: yPos,
                            z: zPos,
                            xVel: pos.x * force,
                            yVel: pos.y * force,
                            zVel: pos.z * force,
                            target: mainScene.enemy,
                            fromPlayer: true
                        }));
                    });
                }
            }
            this.currAmmo = "none";
            this.charge = 0;
        }
    }
    secondaryAttack() {
        this.charge++;
    }
    specialAttack() {
        /* this.charge++;
         if (this.currAmmo !== "dynamite") {
             this.currAmmo = "dynamite";
         }*/
    }
    update() {
        if (mainScene.input.mousePointer.rightButtonDown()) {
            if (this.currAmmo === "none") {
                if (mainScene.keys.Alt.isDown) {
                    this.currAmmo = "dynamite";
                } else {
                    this.currAmmo = "arrow";
                }
            }
            if (this.currAmmo === "dynamite") {
                this.charge += 1 / 2;
            } else {
                this.charge++;
            }
        } else {
            if (this.charge < 60) {
                this.charge = 0;
            }
        }
        mainScene.sword.scale.z = 0.5 + Math.min(this.charge, 60) / 500;
        currXRot += (targetXRot - currXRot) / (slashing ? 10 : 3);
        if (Math.abs(targetXRot - currXRot) < 0.01 && !blocking) {
            if (targetXRot !== 0 && !slashing) {

            }
            targetXRot = 0;
        }
        currYRot += (targetYRot - currYRot) / (slashing ? 10 : 3);
        if (Math.abs(targetYRot - currYRot) < 0.01 && !blocking) {
            targetYRot = Math.PI / 8;
        }
        currXOffset += (targetXOffset - currXOffset) / (slashing ? 10 : 7);
        if (Math.abs(targetXOffset - currXOffset) < 0.01 && !blocking) {
            targetXOffset = 0.6;
        }
        zDepth += (targetZDepth - zDepth) / (slashing ? 10 : 7);
        if (Math.abs(targetZDepth - zDepth) < 0.01 && !blocking) {
            if (targetZDepth !== 0) {}
            targetZDepth = 0;
        }
        currYOffset += (targetYOffset - currYOffset) / (slashing ? 10 : 7);
        if (Math.abs(targetYOffset - currYOffset) < 0.01 && !blocking) {
            if (targetYOffset === 0.35) {
                slashing = false;
            }
            if (slashing) {
                //targetCooldown = 225;
            }
            targetYOffset = 0.35;
        }
        cooldown += (targetCooldown - cooldown) / 10;
        if (Math.abs(targetCooldown - cooldown) < 0.01) {
            targetCooldown = 0;
        }
        if (mainScene.sword) {
            if (this.charge > 0) {
                if (this.currAmmo === "arrow") {
                    mainScene.sword.bowArrow.visible = true;
                    mainScene.sword.dynamite.visible = false;
                } else if (this.currAmmo === "dynamite") {
                    mainScene.sword.bowArrow.visible = false;
                    mainScene.sword.dynamite.visible = true;
                } else {
                    mainScene.sword.bowArrow.visible = false;
                    mainScene.sword.dynamite.visible = false;
                }
            } else {
                mainScene.sword.bowArrow.visible = false;
                mainScene.sword.dynamite.visible = false;
            }
        }
    }
    static loadWeapon(instance) {
        instance.third.load.fbx("crossbow").then(object => {
            object.receiveShadow = true;
            object.castShadow = true;
            loading.innerHTML = "Loading Enemy...";
            instance.sword = object;
            instance.sword.scale.set(0.5, 0.5, 0.5);
            //instance.sword.rotation.z = (-3 * (Math.PI / 2)) + Math.PI;
            //instance.sword.rotation.x = Math.PI / 2;
            instance.sword.rotation.x = Math.PI / 2;
            instance.sword.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = child.receiveShadow = true
                    if (child.material) child.material.metalness = 0
                }
            });
            instance.third.load.fbx("arrow").then(arrow => {
                arrow.scale.set(0.75, 0.33, 0.33);
                arrow.rotation.y = 3 * Math.PI / 2;
                arrow.position.y = 0.15;
                arrow.position.x = -0.014;
                instance.sword.add(arrow);
                instance.sword.bowArrow = arrow;
                instance.sword.bowArrow.visible = false;
            });
            instance.third.load.fbx("bomber-dynamite").then(dynamite => {
                //dynamite.scale.set(0.75, 0.33, 0.33);
                dynamite.rotation.x = 3 * (Math.PI / 2);
                dynamite.rotation.y = Math.PI / 2 + 0.1;
                dynamite.rotation.z = -Math.PI / 8;
                dynamite.position.z = -0.8;
                dynamite.position.x = 0.05;
                dynamite.position.y = 0.35;
                instance.sword.add(dynamite);
                instance.sword.dynamite = dynamite;
                instance.sword.dynamite.visible = false;
            });
            instance.third.add.existing(instance.sword);
            instance.weaponController = new Crossbow();
            levelAIs[currLevel].loadEnemy(instance);
        });
    }
    placeWeapon(instance) {
        // adjust the position of the rifle to the camera
        const raycaster = new THREE.Raycaster();
        // x and y are normalized device coordinates from -1 to +1
        raycaster.setFromCamera({ x: currXOffset - instance.bob.x - 0.5, y: -currYOffset - instance.bob.y - (cooldown / 100) - (framesSinceDeath / 60) - (this.charge > 60 ? Math.sin(performance.now() * 0.0125) * 0.03 : 0) }, instance.third.camera);
        const pos = new THREE.Vector3();
        pos.copy(raycaster.ray.direction);
        pos.multiplyScalar(1.4 + instance.bob.z + zDepth);
        pos.add(raycaster.ray.origin);

        instance.sword.position.copy(pos);
        const rot = instance.third.camera.rotation;
        instance.sword.rotation.copy(rot);
        instance.sword.rotateX(currXRot + Math.PI / 16);
        instance.sword.rotateY(currYRot - Math.PI / 8);
        instance.sword.rotateZ(0);
    }
}