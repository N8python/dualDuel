class Sword extends Weapon {
    constructor() {
        super({
            minDamage: 3,
            maxDamage: 8
        });
        this.tickSinceDamage = 0;
    }
    primaryAttack() {
        if (cooldown < 10 && currXRot < 0.01) {
            targetXRot = -Math.PI / 2 + 0.175;
            targetYRot = 0;
        }
    }
    secondaryAttack() {
        if (cooldown < 10) {
            blocking = true;
            targetYRot = -Math.PI / 2;
            targetXRot = -Math.PI / 2 + 0.8;
            targetXOffset = 0.3;
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
            targetYRot = -Math.PI / 2;
            targetXRot = -Math.PI / 2;
        }
    }
    update() {
        this.tickSinceDamage--;
        currXRot += (targetXRot - currXRot) / (slashing ? 10 : 3);
        if (Math.abs(targetXRot - currXRot) < 0.01 && !blocking) {
            if (targetXRot !== 0 && !slashing && this.tickSinceDamage < 0) {
                this.tickSinceDamage = 20;
                soundManager.slashShort.setVolume(soundManager.random(0.75, 1.25) * localProxy.sfxVolume);
                soundManager.slashShort.rate(soundManager.random(0.75, 1.25));
                soundManager.slashShort.play();
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
            soundManager.metalBlock.setVolume(soundManager.random(0.75, 1.25) * localProxy.sfxVolume);
            soundManager.metalBlock.rate(soundManager.random(0.75, 1.25));
            soundManager.metalBlock.play();
        }
        cooldown += (targetCooldown - cooldown) / 10;
        if (Math.abs(targetCooldown - cooldown) < 0.01) {
            targetCooldown = 0;
        }
    }
    static loadWeapon(instance) {
        instance.third.load.fbx("sword").then(object => {
            object.receiveShadow = true;
            object.castShadow = true;
            loading.innerHTML = "Loading Enemy...";
            instance.sword = object;
            instance.sword.scale.set(0.0015, 0.0015, 0.0015);
            instance.sword.rotation.z = (-3 * (Math.PI / 2)) + Math.PI;
            instance.sword.rotation.x = Math.PI / 2;
            instance.sword.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = child.receiveShadow = true
                    if (child.material) child.material.metalness = 0
                }
            });
            instance.third.add.existing(instance.sword);
            instance.weaponController = new Sword();
            levelAIs[currLevel].loadEnemy(instance);
        });
    }
    placeWeapon(instance) {
        // adjust the position of the rifle to the camera
        const raycaster = new THREE.Raycaster();
        // x and y are normalized device coordinates from -1 to +1
        raycaster.setFromCamera({ x: currXOffset - instance.bob.x, y: -currYOffset - instance.bob.y - (cooldown / 100) - (framesSinceDeath / 60) - 0 }, instance.third.camera);
        const pos = new THREE.Vector3();
        pos.copy(raycaster.ray.direction);
        pos.multiplyScalar(1.2 + instance.bob.z);
        pos.add(raycaster.ray.origin);

        instance.sword.position.copy(pos);
        const rot = instance.third.camera.rotation;
        instance.sword.rotation.copy(rot);
        instance.sword.rotateX(currXRot);
        instance.sword.rotateY(currYRot);
        instance.sword.rotateZ((-3 * (Math.PI / 2)) + Math.PI + 0.2);
    }
}