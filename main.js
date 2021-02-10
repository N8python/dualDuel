const { enable3d, Scene3D, Canvas, ThirdDimension, ExtendedObject3D, FirstPersonControls, THREE } = ENABLE3D
let player;
let canJump = true;
let targetXRot = 0;
let currXRot = 0;
let currYRot = Math.PI / 8;
let targetYRot = Math.PI / 8;
let currXOffset = 0.6;
let targetXOffset = 0.6;
let currYOffset = 0.35;
let targetYOffset = 0.35;
let cooldown = 0;
let targetCooldown = 0;
let blocking = false;
let slashing = false;
let objects = [];

function angleDifference(angle1, angle2) {
    const diff = ((angle2 - angle1 + Math.PI) % (Math.PI * 2)) - Math.PI;
    return (diff < -Math.PI) ? diff + (Math.PI * 2) : diff;
}
class MainScene extends Scene3D {
    constructor() {
        super({ key: 'MainScene' })
        this.bob = { x: 0, y: 0, z: 0 };
    }
    handleSwing() {
        objects.forEach(object => {
            const theta = Math.atan2(object.position.x - this.player.position.x, object.position.z - this.player.position.z);
            const dist = Math.hypot(object.position.x - this.player.position.x, object.position.z - this.player.position.z);
            const direction = new THREE.Vector3();
            const rotation = this.third.camera.getWorldDirection(direction)
            const cTheta = Math.atan2(rotation.x, rotation.z);
            const angleDiff = cTheta - theta;
            if (angleDiff < (slashing ? Math.PI / 4 : Math.PI / 6) && angleDiff > (slashing ? -Math.PI / 4 : 0) && dist < 3.5 && Math.abs(object.position.y - player.position.y) < 2) {
                object.body.setVelocity(object.body.velocity.x + 3 * (1 + +slashing) * Math.sin(theta), object.body.velocity.y + 2.5, object.body.velocity.z + 3 * (1 + +slashing) * Math.cos(theta));
            }
            // const cameraTheta = Math.atan2(this.third.camera.rotation.x, this.third.camera.rotation.z);
            /*if (Math.abs(this.third.camera.position.angleTo(object.position)) < Math.PI / 4) {
                object.body.setVelocity(3 * Math.sin(theta), 2, 3 * Math.cos(theta));
            }*/
        });
    }
    create() {
        this.accessThirdDimension({ maxSubSteps: 10, fixedTimeStep: 1 / 180 })
        this.third.warpSpeed('-orbitControls')
            //this.third.haveSomeFun(50);
        for (let i = 0; i < 0; i++) {
            objects.push(this.third.physics.add.box({
                x: Math.random() * 20 - 10,
                y: Math.random() * 5,
                z: Math.random() * 20 - 10,
                width: Math.random(),
                height: Math.random(),
                depth: Math.random()
            }, { phong: { color: 0xffffff * Math.random() } }));
        }
        this.third.renderer.gammaFactor = 1.5;

        // add red dot
        // add player
        this.player = this.third.physics.add.sphere();
        this.player.position.setY(1);
        player = this.player;
        this.player.body.on.collision((otherObject, event) => {
            if (otherObject.name === "ground" && event === "collision") {
                canJump = true;
            }
        });
        this.player.body.setFriction(1);
        this.third.load.fbx("samurai-sword.fbx").then(object => {
            this.sword = object;
            this.sword.scale.set(0.0015, 0.0015, 0.0015);
            this.sword.rotation.z = (-3 * (Math.PI / 2)) + Math.PI;
            this.sword.rotation.x = Math.PI / 2;
            this.sword.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = child.receiveShadow = true
                    if (child.material) child.material.metalness = 0
                }
            })
            this.third.add.existing(this.sword);
        })
        this.enemy = new ExtendedObject3D();
        const animations = ["Idle", "Running"];
        this.third.load.fbx('Breathing Idle.fbx').then(object => {
                //object.scale.set(0.0075, 0.0075, 0.0075);
                this.enemy.add(object);
                this.enemy.position.set(5, 1, 5);
                this.enemy.scale.set(0.0075, 0.0075, 0.0075);
                this.third.animationMixers.add(this.enemy.animation.mixer);
                this.enemy.animation.add('Idle', object.animations[0]);
                this.enemy.animation.play('Idle');
                this.enemy.cooldown = 0;
                this.third.load.fbx("sg-sword.fbx").then(object => {
                    object.scale.set(0.03, 0.03, 0.03);
                    //this.third.add.existing(object);
                    this.enemy.traverse(child => {
                        if (child.name === 'mixamorig6RightHand') {
                            //console.log("YAY")
                            //this.third.add.box({ width: 20, height: 20, depth: 20 })
                            child.add(object);
                        }
                    })
                });
                this.third.add.existing(this.enemy);
                this.third.physics.add.existing(this.enemy, { shape: 'box', ignoreScale: true, offset: { y: -0.5 } });
                objects.push(this.enemy);
                this.enemy.loaded = true;
                //animations.slice(1).forEach(key => {
                this.third.load.fbx(`Warrior Running.fbx`).then(object => {
                    this.enemy.animation.add("R", object.animations[0]);
                    //this.enemy.animation.play('R');
                    //this.enemy.animation.mixer._actions[0].setEffectiveWeight(1);
                    //this.enemy.animation.mixer._actions[1].setEffectiveWeight(0);
                    this.enemy.aggro = false;
                    this.third.load.fbx("Warrior Slash.fbx").then(object => {
                        this.enemy.animation.add("S", object.animations[0]);
                        //this.enemy.animation.play('S');
                        //this.enemy.animation.mixer._actions[2].setEffectiveWeight(0);
                    })
                });
                //})
                //this.third.add.existing(object);
                //this.third.physics.add.existing(object);
            })
            // add first person controls
        this.firstPersonControls = new FirstPersonControls(this.third.camera, this.player, {})

        // lock the pointer and update the first person control
        this.input.on('pointerdown', () => {
            if (this.input.mousePointer.rightButtonDown() && cooldown < 10) {
                blocking = true;
                targetYRot = -Math.PI / 2;
                targetXRot = -Math.PI / 2 + 0.8;
                targetXOffset = 0.3;
            } else if (this.keys.Alt.isDown && cooldown < 10 && !slashing) {
                slashing = true;
                this.handleSwing();
                targetXOffset = -0.6;
                targetYOffset = 0.6;
                targetYRot = -Math.PI / 2;
                targetXRot = -Math.PI / 2;
            } else if (cooldown < 10) {
                targetXRot = -Math.PI / 2 + 0.175;
                targetYRot = 0;
            }
            this.input.mouse.requestPointerLock()
        })
        this.input.on('pointermove', pointer => {
            if (this.input.mouse.locked) {
                this.firstPersonControls.update(pointer.movementX, pointer.movementY)
            }
        })
        this.events.on('update', () => {
            this.firstPersonControls.update(0, 0)
        })

        // add keys
        this.keys = {
            w: this.input.keyboard.addKey('w'),
            a: this.input.keyboard.addKey('a'),
            s: this.input.keyboard.addKey('s'),
            d: this.input.keyboard.addKey('d'),
            Alt: this.input.keyboard.addKey('Alt')
        }
    }

    update(time, delta) {
        /* if (this.enemy) {
             this.enemy.animation.play('Running');
         }*/
        //this.enemy.lookAt(player.position);
        //this.enemy.lookAt(this.player.position);
        this.enemy.cooldown--;
        if (this.enemy.cooldown === 0) {
            if (this.enemy.position.distanceTo(player.position) > 2) {
                this.enemy.animation.play("R");
                this.enemy.attacking = false;
            }
        }
        if (this.enemy && this.enemy.body && (this.enemy.position.distanceTo(player.position) < 5 || this.enemy.aggro) && !this.enemy.attacking) {
            if (!this.enemy.aggro) {
                this.enemy.animation.play("R");
                //this.enemy.animation.mixer._actions[0].setEffectiveWeight(0);
                //this.enemy.animation.mixer._actions[1].setEffectiveWeight(1);
                //this.enemy.animation.mixer._actions[2].setEffectiveWeight(0);
                /*this.enemy.animation.mixer._actions.forEach(a => {
                    a.setEffectiveWeight(0);
                });*/
                //this.enemy.animation.mixer._actions[0].setEffectiveWeight(0);
                //this.enemy.animation.mixer._actions[1].setEffectiveWeight(1);
            }
            this.enemy.aggro = true;
            const theta = Math.atan2(this.player.position.x - this.enemy.position.x, this.player.position.z - this.enemy.position.z);
            this.enemy.body.setVelocity((this.enemy.body.velocity.x + 0.1 * Math.sin(this.enemy.body.rotation.y)) * 0.975, this.enemy.body.velocity.y, (this.enemy.body.velocity.z + 0.1 * Math.cos(this.enemy.body.rotation.y)) * 0.975);
            //console.log(this.enemy.body);
            //console.log((theta - this.enemy.rotation.y));
            this.enemy.body.setAngularVelocityX(-this.enemy.body.rotation.x / 5);
            this.enemy.body.setAngularVelocityZ(-this.enemy.body.rotation.z / 5);
            this.enemy.body.setAngularVelocityY(-angleDifference(theta, this.enemy.body.rotation.y) * 4);
        }
        /*if (this.enemy.position.distanceTo(player.position) > 12) {
            if (this.enemy.aggro) {
                this.enemy.animation.play("Idle");
            }
            this.enemy.aggro = false;
            // this.enemy.animation.mixer._actions[0].setEffectiveWeight(1);
            //this.enemy.animation.mixer._actions[1].setEffectiveWeight(0);
        }*/
        if (this.enemy && this.enemy.body && this.enemy.position.distanceTo(player.position) < 2 && this.enemy.cooldown < 0) {
            if (!this.enemy.attacking) {
                this.enemy.animation.play("S");
            }
            this.enemy.attacking = true;
            this.enemy.cooldown = 100;
            setTimeout(() => {
                if (this.enemy.position.distanceTo(player.position) < 3) {
                    if (blocking) {
                        targetCooldown = 100;
                    } else {
                        this.player.body.setVelocity(this.player.body.velocity.x + 5 * Math.sin(this.enemy.body.rotation.y), this.player.body.velocity.y + 4, this.player.body.velocity.z + 5 * Math.cos(this.enemy.body.rotation.y));
                    }
                }
            }, 500);
            /*this.enemy.animation.mixer._actions[0].setEffectiveWeight(0);
            this.enemy.animation.mixer._actions[1].setEffectiveWeight(0);
            this.enemy.animation.mixer._actions[2].setEffectiveWeight(1);*/
        }
        const block = this.input.mousePointer.rightButtonDown();
        if (!block) {
            blocking = false;
        }
        currXRot += (targetXRot - currXRot) / (slashing ? 10 : 3);
        if (Math.abs(targetXRot - currXRot) < 0.01 && !blocking) {
            if (targetXRot !== 0 && !slashing) {
                this.handleSwing();
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
        if (this.keys.w.isDown) {
            this.bob.x = Math.sin(time * -0.009) * 0.0075;
            this.bob.y = Math.sin(time * 0.009) * 0.0075;
            this.bob.z = Math.sin(time * 0.009) * 0.0075;
        } else {
            this.bob.x = Math.sin(time * -0.003) * 0.0075;
            this.bob.y = Math.sin(time * 0.003) * 0.0075;
            this.bob.z = Math.sin(time * 0.003) * 0.0075;
        }
        this.third.camera.position.y += this.bob.y * 1.75;
        if (this.sword) {
            // adjust the position of the rifle to the camera
            const raycaster = new THREE.Raycaster();
            // x and y are normalized device coordinates from -1 to +1
            raycaster.setFromCamera({ x: currXOffset - this.bob.x, y: -currYOffset - this.bob.y - (cooldown / 100) }, this.third.camera);
            const pos = new THREE.Vector3();
            pos.copy(raycaster.ray.direction);
            pos.multiplyScalar(1.2 + this.bob.z);
            pos.add(raycaster.ray.origin);

            this.sword.position.copy(pos);
            const rot = this.third.camera.rotation;
            this.sword.rotation.copy(rot);
            document.getElementById("log1").innerHTML = `Camera Position: [${pos.x}, ${pos.y}, ${pos.z}]`;
            document.getElementById("log2").innerHTML = `Camera Rotation: [${rot.x}, ${rot.y}, ${rot.z}]`;
            this.sword.rotateX(currXRot);
            this.sword.rotateY(currYRot);
            this.sword.rotateZ((-3 * (Math.PI / 2)) + Math.PI + 0.2);
            document.getElementById("log3").innerHTML = `Sword Position: [${this.sword.position.x}, ${this.sword.position.y}, ${this.sword.position.z}]`;
            document.getElementById("log4").innerHTML = `Sword Rotation: [${this.sword.rotation.x}, ${this.sword.rotation.y}, ${this.sword.rotation.z}]`;
        }
        const oldVelocity = this.player.body.velocity;
        const velocityUpdate = [oldVelocity.x, oldVelocity.y, oldVelocity.z];
        const direction = new THREE.Vector3();
        const rotation = this.third.camera.getWorldDirection(direction);
        const theta = Math.atan2(rotation.x, rotation.z);
        const speed = 0.25;
        if (this.keys.w.isDown) {
            velocityUpdate[0] += Math.sin(theta) * speed;
            velocityUpdate[2] += Math.cos(theta) * speed;
        } else if (this.keys.s.isDown) {
            velocityUpdate[0] -= Math.sin(theta) * speed;
            velocityUpdate[2] -= Math.cos(theta) * speed;
        }
        if (this.keys.a.isDown) {
            velocityUpdate[0] += Math.sin(theta + Math.PI / 2) * speed;
            velocityUpdate[2] += Math.cos(theta + Math.PI / 2) * speed;
        } else if (this.keys.d.isDown) {
            velocityUpdate[0] += Math.sin(theta - Math.PI / 2) * speed;
            velocityUpdate[2] += Math.cos(theta - Math.PI / 2) * speed;
        }
        velocityUpdate[0] *= 0.975;
        velocityUpdate[2] *= 0.975;
        this.player.body.setVelocity(...velocityUpdate);
    }
}
document.onkeydown = (e) => {
    if (e.key === " " && player && canJump) {
        const oldVelocity = player.body.velocity;
        const velocityUpdate = [oldVelocity.x, oldVelocity.y, oldVelocity.z];
        velocityUpdate[1] += 5;
        player.body.setVelocity(...velocityUpdate);
        canJump = false;
    }
}

const config = {
    type: Phaser.WEBGL,
    transparent: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
    },
    scene: [MainScene],
    ...Canvas({ antialias: true })
}

window.addEventListener('load', () => {
    enable3d(() => new Phaser.Game(config)).withPhysics('/lib')
})