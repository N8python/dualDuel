class Claw extends Weapon {
    constructor() {
        super({
            minDamage: 6,
            maxDamage: 16
        });
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
            // targetYRot = -Math.PI / 32;
            targetXRot = -Math.PI / 2 + 0.8;
            targetZRot = Math.PI / 4;
            targetXOffset = 0.3;
        }
    }
    specialAttack() {
        if (cooldown < 10 && !slashing) {
            slashing = true;
            this.handleSwing({
                rightBound: Math.PI / 4,
                leftBound: -Math.PI / 4
            });
            const raycaster = new THREE.Raycaster()
            const x = 0
            const y = 0
            const force = 0.75;
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
            player.body.transform();
            mainScene.ice.emitters[0].position.x = xPos + pos.x * force;
            mainScene.ice.emitters[0].position.y = 0.25;
            mainScene.ice.emitters[0].position.z = zPos + pos.z * force;
            mainScene.ice.emitters[0].currentEmitTime = 0;
            dealExplodeDamage({
                x: xPos + pos.x * force,
                y: 0.25,
                z: zPos + pos.z * force
            }, 10, 1.5, 6, true, false);
            targetXOffset = -0.6;
            targetYOffset = 0.6;
            targetYRot = Math.PI / 2;
            targetXRot = -Math.PI / 2;
        }
    }
    update() {
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
                if (slashing) {}
                slashing = false;
            }
            if (slashing) {
                //targetCooldown = 225;
            }
            targetYOffset = 0.35;
        }
        cooldown += (targetCooldown - cooldown) / 5;
        if (Math.abs(targetCooldown - cooldown) < 0.01) {
            targetCooldown = 0;
        }
    }
    static loadWeapon(instance) {
        instance.third.load.fbx("claw").then(object => {
            object.receiveShadow = true;
            object.castShadow = true;
            loading.innerHTML = "Loading Enemy...";
            instance.sword = object;
            instance.sword.scale.set(0.0075, 0.0075, 0.0075);
            instance.sword.rotation.z = (-3 * (Math.PI / 2)) + Math.PI;
            instance.sword.rotation.x = Math.PI / 2;
            instance.sword.rotation.y = Math.PI;
            instance.sword.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = child.receiveShadow = true
                    if (child.material) child.material.metalness = 0
                }
            });
            instance.third.add.existing(instance.sword);
            instance.weaponController = new Claw();
            levelAIs[currLevel].loadEnemy(instance);
        });
    }
    placeWeapon(instance) {
        // adjust the position of the rifle to the camera
        const raycaster = new THREE.Raycaster();
        // x and y are normalized device coordinates from -1 to +1
        raycaster.setFromCamera({ x: currXOffset - instance.bob.x, y: -currYOffset - instance.bob.y - (cooldown / 100) - (framesSinceDeath / 60) - 0.3 }, instance.third.camera);
        const pos = new THREE.Vector3();
        pos.copy(raycaster.ray.direction);
        pos.multiplyScalar(1.2 + instance.bob.z);
        pos.add(raycaster.ray.origin);

        instance.sword.position.copy(pos);
        const rot = instance.third.camera.rotation;
        instance.sword.rotation.copy(rot);
        instance.sword.rotateX(currXRot);
        instance.sword.rotateY(currYRot);
        instance.sword.rotateZ((-3 * (Math.PI / 2)) + Math.PI + 0.2 + Math.PI + currZRot);
    }
}