class Boomerang extends Weapon {
    constructor() {
        super({
            minDamage: 3,
            maxDamage: 8
        });
        this.thrown = false;
        this.throwCooldown = 0;
    }
    primaryAttack() {
        if (cooldown < 10 && !this.thrown) {
            const raycaster = new THREE.Raycaster()
            const x = 0
            const y = 0
            const force = 5
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
            mainScene.third.load.fbx("boomerang").then(model => {
                mainScene.sword.rang.visible = false;
                this.thrown = true;
                soundManager.boomerang.setVolume(soundManager.random(0.6, 0.8) * localProxy.sfxVolume);
                soundManager.boomerang.rate(soundManager.random(0.75, 1.25));
                soundManager.boomerang.play();
                projectiles.push(new Rang({
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
                this.throwCooldown = 30;
            })
        }
    }
    secondaryAttack() {
        if (cooldown < 10) {
            blocking = true;
            targetYRot = -Math.PI / 2 - 0.25;
            targetXRot = -Math.PI / 2 + 0.8;
            targetXOffset = 0.5;
        }
    }
    specialAttack() {
        if (cooldown < 10 && !slashing) {
            slashing = true;
            soundManager.slashLong.setVolume(soundManager.random(0.4, 0.6) * localProxy.sfxVolume);
            soundManager.slashLong.rate(soundManager.random(0.75, 1.25));
            soundManager.slashLong.play();
            this.handleSwing({
                rightBound: Math.PI / 4,
                leftBound: -Math.PI / 4
            });
            targetXOffset = -0.6;
            targetYOffset = 0.6;
            targetYRot = Math.PI / 2;
            //targetXRot = -Math.PI / 2;
        }
    }
    update() {
        this.throwCooldown--;
        currXRot += (targetXRot - currXRot) / (slashing ? 10 : 3);
        if (Math.abs(targetXRot - currXRot) < 0.01 && !blocking) {
            if (targetXRot !== 0 && !slashing) {
                this.handleSwing({
                    rightBound: Math.PI / 6,
                    leftBound: 0
                });
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
        if (cooldown < 1 && targetCooldown > 0) {
            soundManager.woodBlock.setVolume(soundManager.random(0.25, 0.45) * localProxy.sfxVolume);
            soundManager.woodBlock.rate(soundManager.random(0.75, 1.25));
            soundManager.woodBlock.play();
        }
        cooldown += (targetCooldown - cooldown) / 10;
        if (Math.abs(targetCooldown - cooldown) < 0.01) {
            targetCooldown = 0;
        }
        projectiles.forEach(projectile => {
            if (projectile instanceof Rang && !projectile.fromEnemy && this.throwCooldown < 1) {
                if (projectile.rang.position.distanceTo(player.position) < 1.5) {
                    soundManager.boomerang.stop();
                    this.thrown = false;
                    mainScene.sword.rang.visible = true;
                    projectile.rang.visible = false;
                    objects.splice(objects.indexOf(projectile.rang), 1);
                    projectiles.splice(projectiles.indexOf(projectile), 1);
                    mainScene.third.physics.destroy(projectile.rang);
                    mainScene.third.scene.children.splice(mainScene.third.scene.children.indexOf(projectile.rang), 1);
                } else if ((projectile.rang.position.y + 3 < player.position.y && projectile.rang.position.y < 0) || projectile.rang.tick > 300) {
                    soundManager.boomerang.stop();
                    this.thrown = false;
                    mainScene.sword.rang.visible = true;
                    projectile.rang.visible = false;
                    objects.splice(objects.indexOf(projectile.rang), 1);
                    projectiles.splice(projectiles.indexOf(projectile), 1);
                    mainScene.third.physics.destroy(projectile.rang);
                    mainScene.third.scene.children.splice(mainScene.third.scene.children.indexOf(projectile.rang), 1);
                }
            }
        });
    }
    static loadWeapon(instance) {
        instance.third.load.fbx("boomerang").then(object => {
            object.receiveShadow = true;
            object.castShadow = true;
            loading.innerHTML = "Loading Enemy...";
            instance.sword = object;
            instance.sword.scale.set(0.25, 0.25, 0.25);
            //instance.sword.rotation.z = (-3 * (Math.PI / 2)) + Math.PI;
            //instance.sword.rotation.x = Math.PI / 2;
            instance.sword.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = child.receiveShadow = true
                    if (child.material) child.material.metalness = 0
                }
            });
            instance.third.add.existing(instance.sword);
            instance.weaponController = new Boomerang();
            instance.sword.rang = object;
            levelAIs[currLevel].loadEnemy(instance);
        });
    }
    placeWeapon(instance) {
        // adjust the position of the rifle to the camera
        const raycaster = new THREE.Raycaster();
        // x and y are normalized device coordinates from -1 to +1
        raycaster.setFromCamera({ x: currXOffset - instance.bob.x - 0.375, y: -currYOffset - instance.bob.y - (cooldown / 100) - (framesSinceDeath / 60) - 0.15 }, instance.third.camera);
        const pos = new THREE.Vector3();
        pos.copy(raycaster.ray.direction);
        pos.multiplyScalar(1.2 + instance.bob.z);
        pos.add(raycaster.ray.origin);

        instance.sword.position.copy(pos);
        const rot = instance.third.camera.rotation;
        instance.sword.rotation.copy(rot);
        instance.sword.rotateX(currXRot);
        instance.sword.rotateY(currYRot + Math.PI);
        instance.sword.rotateZ(-0.175);
    }
}