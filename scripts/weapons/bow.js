class Bow extends Weapon {
    constructor() {
        super({
            minDamage: 2,
            maxDamage: 5
        });
        this.charge = 0;
    }
    primaryAttack() {
        if (cooldown < 10) {
            targetXRot = -Math.PI / 2 + 0.175;
            targetYRot = 0;
        }
    }
    secondaryAttack() {
        //if (cooldown < 10) {
        this.charge++;
        //targetYRot = -Math.PI / 2;
        //targetXRot = -Math.PI / 2 + 0.8;
        //targetXOffset = 0.3;
        //}
    }
    specialAttack() {
        if (cooldown < 10 && !slashing) {
            slashing = true;
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
        if (mainScene.input.mousePointer.rightButtonDown()) {
            this.charge++;
            mainScene.sword.bowArrow.visible = true;
            mainScene.sword.scale.set(0.00045, 0.00045, 0.00045 + Math.min(this.charge, 60) / 240000);
        } else {
            if (mainScene.sword.scale.z > 0.00045 && mainScene.sword.scale.z >= 0.0007) {
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
                mainScene.third.load.fbx("arrow").then(model => {
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
                    })
                    //sphere.body.applyForce(pos.x * force, pos.y * force, pos.z * force)
            }
            mainScene.sword.scale.set(0.00045, 0.00045, 0.00045);
            this.charge = 0;
            mainScene.sword.bowArrow.visible = false;
        }
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
        cooldown += (targetCooldown - cooldown) / 10;
        if (Math.abs(targetCooldown - cooldown) < 0.01) {
            targetCooldown = 0;
        }
    }
    static loadWeapon(instance) {
        instance.third.load.fbx("bow").then(object => {
            object.children = [object.children[3], object.children[5]];
            object.receiveShadow = true;
            object.castShadow = true;
            loading.innerHTML = "Loading Enemy...";
            instance.sword = object;
            instance.sword.scale.set(0.00045, 0.00045, 0.00045);
            instance.sword.rotation.z = (-3 * (Math.PI / 2)) + Math.PI;
            instance.sword.rotation.x = Math.PI / 2;
            instance.sword.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = child.receiveShadow = true
                    if (child.material) child.material.metalness = 0
                }
            });
            instance.third.load.fbx("arrow").then(arrow => {
                arrow.scale.set(150, 60, 60);
                arrow.rotation.y = 3 * Math.PI / 2;
                instance.sword.add(arrow);
                instance.sword.bowArrow = arrow;
            });
            instance.third.add.existing(instance.sword);
            instance.weaponController = new Bow();
            levelAIs[currLevel].loadEnemy(instance);
        });
    }
    placeWeapon(instance) {
        // adjust the position of the rifle to the camera
        const raycaster = new THREE.Raycaster();
        // x and y are normalized device coordinates from -1 to +1
        raycaster.setFromCamera({ x: currXOffset - instance.bob.x, y: -currYOffset - instance.bob.y - (this.charge > 60 ? Math.sin(performance.now() * 0.025) * 0.03 : 0) - (cooldown / 100) - (framesSinceDeath / 60) + 0.3 }, instance.third.camera);
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