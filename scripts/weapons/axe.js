class Axe extends Weapon {
    constructor() {
        super({
            minDamage: 5,
            maxDamage: 10
        });
    }
    primaryAttack() {
        if (cooldown < 10) {
            targetXRot = -Math.PI / 2 + 0.175;
            targetYRot = 0;
            targetCooldown = 20;
        }
    }
    secondaryAttack() {
        if (cooldown < 10) {
            blocking = true;
            targetZRot = 0.5;
            targetYRot = Math.PI / 2;
            //targetXRot = -Math.PI / 2 + 1.2;
            targetXOffset = -0.05;
            targetYOffset = 0.65;
        }
    }
    specialAttack() {
        if (cooldown < 10 && !slashing) {
            slashing = true;
            this.handleSwing({
                rightBound: Math.PI / 4,
                leftBound: -Math.PI / 4,
                buff: 4,
                verticalKnockback: 3.5,
                knockback: 1.5,
                reach: 4
            });
            targetXOffset = 0.125;
            targetYOffset = 0.6;
            targetXRot = -Math.PI / 2;
            //targetYRot = -Math.PI / 2;
            //targetXRot = -Math.PI / 2;
        }
    }
    update() {
        currXRot += (targetXRot - currXRot) / (slashing ? 10 : 3);
        if (Math.abs(targetXRot - currXRot) < 0.01 && !blocking) {
            if (targetXRot !== 0) {
                this.handleSwing({
                    rightBound: Math.PI / 4,
                    leftBound: -Math.PI / 8
                });
            }
            if (slashing) {
                targetCooldown = 125;
            }
            targetXRot = 0;
        }
        currYRot += (targetYRot - currYRot) / (slashing ? 10 : 3);
        if (Math.abs(targetYRot - currYRot) < 0.01 && !blocking) {
            targetYRot = Math.PI / 8;
        }
        currZRot += (targetZRot - currZRot) / (slashing ? 10 : 3);
        if (Math.abs(targetZRot - currZRot) < 0.01 && !blocking) {
            targetZRot = 0;
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
        cooldown += (targetCooldown - cooldown) / 10;
        if (Math.abs(targetCooldown - cooldown) < 0.01) {
            targetCooldown = 0;
        }
    }
    static loadWeapon(instance) {
        instance.third.load.fbx("axe").then(object => {
            object.children = [object.children[2]];
            object.receiveShadow = true;
            object.castShadow = true;
            loading.innerHTML = "Loading Enemy...";
            instance.sword = object;
            instance.sword.scale.set(0.04, 0.04, 0.04);
            instance.sword.rotation.z = (-3 * (Math.PI / 2)) + Math.PI;
            instance.sword.rotation.x = Math.PI / 2;
            instance.sword.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = child.receiveShadow = true
                    if (child.material) child.material.metalness = 0
                }
            });
            instance.third.add.existing(instance.sword);
            instance.weaponController = new Axe();
            levelAIs[currLevel].loadEnemy(instance);
        });
    }
    placeWeapon(instance) {
        // adjust the position of the rifle to the camera
        const raycaster = new THREE.Raycaster();
        // x and y are normalized device coordinates from -1 to +1
        raycaster.setFromCamera({ x: currXOffset - instance.bob.x - 0.4, y: -currYOffset - instance.bob.y - (cooldown / 100) - (framesSinceDeath / 60) - 0.5 }, instance.third.camera);
        const pos = new THREE.Vector3();
        pos.copy(raycaster.ray.direction);
        pos.multiplyScalar(1.2 + instance.bob.z);
        pos.add(raycaster.ray.origin);

        instance.sword.position.copy(pos);
        const rot = instance.third.camera.rotation;
        instance.sword.rotation.copy(rot);
        instance.sword.rotateX(currXRot);
        instance.sword.rotateY(currYRot);
        instance.sword.rotateZ(currZRot);
    }
}