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
let jumpCooldown = 0;
let blocking = false;
let slashing = false;
let framesSinceDeath = 0;
let objects = [];
let bootFunction;
const healthBars = document.getElementById("healthBars").getContext("2d");
const loading = document.getElementById("loading");
const gameOverMessage = document.getElementById("gameOverMessage");

function angleDifference(angle1, angle2) {
    const diff = ((angle2 - angle1 + Math.PI) % (Math.PI * 2)) - Math.PI;
    return (diff < -Math.PI) ? diff + (Math.PI * 2) : diff;
}
class MainScene extends Scene3D {
    constructor() {
        super({ key: 'MainScene' })
        this.bob = { x: 0, y: 0, z: 0 };
    }
    static loadInstance(instance) {
        instance.initiated = true;
        instance.accessThirdDimension({ maxSubSteps: 10, fixedTimeStep: 1 / 180 })
        instance.third.warpSpeed('-orbitControls')
            //this.third.haveSomeFun(50);
        for (let i = 0; i < 0; i++) {
            objects.push(instance.third.physics.add.box({
                x: 3.5,
                y: Math.random() * 5,
                z: 3.5,
                width: Math.random(),
                height: Math.random(),
                depth: Math.random()
            }, { phong: { color: 0xffffff * Math.random() } }));
        }
        instance.third.renderer.gammaFactor = 1.5;
        const walls = [];
        walls.push(instance.third.physics.add.box({ height: 2.5, z: 10, y: 1.25, width: 21, depth: 1 }, { phong: { color: 0x0000cc } }));
        walls.push(instance.third.physics.add.box({ height: 2.5, z: -10, y: 1.25, width: 21, depth: 1 }, { phong: { color: 0x0000cc } }));
        walls.push(instance.third.physics.add.box({ height: 2.5, x: 10, y: 1.25, width: 1, depth: 21 }, { phong: { color: 0x0000cc } }));
        walls.push(instance.third.physics.add.box({ height: 2.5, x: -10, y: 1.25, width: 1, depth: 21 }, { phong: { color: 0x0000cc } }));

        walls.forEach(wall => {
            wall.body.setCollisionFlags(2);
        });
        instance.walls = walls;
        // add red dot
        // add player
        instance.player = instance.third.physics.add.sphere({ z: -5 });
        instance.player.health = 100;
        instance.player.maxHealth = 100;
        player = instance.player;
        /* this.player.body.on.collision((otherObject, event) => {
             if ((otherObject.name === "ground") && event === "collision") {
                 canJump = true;
             }
         });*/
        instance.player.body.setFriction(1);
        loading.innerHTML = "Loading Weapon...";
        instance.third.load.fbx("samurai-sword.fbx").then(object => {
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
            })
            instance.third.add.existing(instance.sword);
        })
        instance.enemy = new ExtendedObject3D();
        instance.third.load.fbx('Breathing Idle.fbx').then(object => {
            //object.scale.set(0.0075, 0.0075, 0.0075);
            instance.enemy.add(object);
            instance.enemy.position.set(0, 1, 5);
            instance.enemy.scale.set(0.0075, 0.0075, 0.0075);
            instance.third.animationMixers.add(instance.enemy.animation.mixer);
            instance.enemy.animation.add('Idle', object.animations[0]);
            instance.third.load.fbx("sg-sword.fbx").then(object => {
                object.scale.set(0.03, 0.03, 0.03);
                //this.third.add.existing(object);
                instance.enemy.traverse(child => {
                    if (child.name === 'mixamorig6RightHand') {
                        //console.log("YAY")
                        //this.third.add.box({ width: 20, height: 20, depth: 20 })
                        child.add(object);
                    }
                })
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
            instance.third.load.fbx("Excited.fbx").then(object => {
                console.log(JSON.stringify(object.animations[0].toJSON()))
            });
            const animsToLoad = ["running", "slashing", "death", "celebrate"];
            (async() => {
                loading.innerHTML = `Loading Enemy Animations (0/${animsToLoad.length})...`;
                for (const anim of animsToLoad) {
                    loading.innerHTML = `Loading Enemy Animations (${animsToLoad.indexOf(anim)}/${animsToLoad.length})...`;
                    const animText = await fetch(`warrior-${anim}.json`);
                    const animJson = await animText.json();
                    instance.enemy.animation.add(anim[0].toUpperCase(), THREE.AnimationClip.parse(animJson));
                }
                instance.enemyAI = new EnemyAI(instance.enemy);
                loading.innerHTML = `Loaded!`;
                setTimeout(() => {
                    loading.innerHTML = "";
                })
            })();
            //})
            //this.third.add.existing(object);
            //this.third.physics.add.existing(object);
        });
        // add first person controls
        instance.firstPersonControls = new FirstPersonControls(instance.third.camera, instance.player, {})

        // lock the pointer and update the first person control
        instance.input.on('pointerdown', () => {
            if (instance.player && instance.player.health === 0) {
                return;
            }
            if (instance.input.mousePointer.rightButtonDown() && cooldown < 10) {
                blocking = true;
                targetYRot = -Math.PI / 2;
                targetXRot = -Math.PI / 2 + 0.8;
                targetXOffset = 0.3;
            } else if (instance.keys.Alt.isDown && cooldown < 10 && !slashing) {
                slashing = true;
                instance.handleSwing();
                targetXOffset = -0.6;
                targetYOffset = 0.6;
                targetYRot = -Math.PI / 2;
                targetXRot = -Math.PI / 2;
            } else if (cooldown < 10) {
                targetXRot = -Math.PI / 2 + 0.175;
                targetYRot = 0;
            }
            instance.input.mouse.requestPointerLock()
        })
        instance.input.on('pointermove', pointer => {
            if (instance.input.mouse.locked && instance.player && instance.player.health > 0) {
                instance.firstPersonControls.update(pointer.movementX, pointer.movementY)
            }
        })
        instance.events.on('update', () => {
            instance.firstPersonControls.update(0, 0)
        })

        // add keys
        instance.keys = {
            w: instance.input.keyboard.addKey('w'),
            a: instance.input.keyboard.addKey('a'),
            s: instance.input.keyboard.addKey('s'),
            d: instance.input.keyboard.addKey('d'),
            Alt: instance.input.keyboard.addKey('Alt')
        }
    };
    handleSwing() {
        objects.forEach(object => {
            const theta = Math.atan2(object.position.x - this.player.position.x, object.position.z - this.player.position.z);
            const dist = Math.hypot(object.position.x - this.player.position.x, object.position.z - this.player.position.z);
            const direction = new THREE.Vector3();
            const rotation = this.third.camera.getWorldDirection(direction)
            const cTheta = Math.atan2(rotation.x, rotation.z);
            const angleDiff = cTheta - theta;
            if (angleDiff < (slashing ? Math.PI / 4 : Math.PI / 6) && angleDiff > (slashing ? -Math.PI / 4 : 0) && dist < 3.5 && Math.abs(object.position.y - player.position.y) < 2 && !object.dead) {
                object.body.setVelocity(object.body.velocity.x + 3 * (1 + +slashing) * Math.sin(theta), object.body.velocity.y + 2.5, object.body.velocity.z + 3 * (1 + +slashing) * Math.cos(theta));
                if (object.health) {
                    object.health -= Math.floor(Math.random() * 5 + 3 + 3 * +slashing);
                    object.health = Math.max(0, object.health);
                }
            }
            // const cameraTheta = Math.atan2(this.third.camera.rotation.x, this.third.camera.rotation.z);
            /*if (Math.abs(this.third.camera.position.angleTo(object.position)) < Math.PI / 4) {
                object.body.setVelocity(3 * Math.sin(theta), 2, 3 * Math.cos(theta));
            }*/
        });
    }
    create() {
        const self = this;
        bootFunction = () => { MainScene.loadInstance(self) };
    }

    update(time, delta) {
        if (!this.initiated) {
            return;
        }
        jumpCooldown -= 1;
        this.player.health = Math.max(this.player.health, 0);
        if (this.player.health === 0) {
            if (framesSinceDeath === 0) {
                gameOverMessage.innerHTML = "You Died!"
            }
            framesSinceDeath++;
        }
        healthBars.fillStyle = "black";
        healthBars.fillRect(76, 1, 158, 28);
        healthBars.fillStyle = `rgb(${255 * (1 - (player.health / player.maxHealth))}, ${255 * (player.health / player.maxHealth)}, 0)`;
        healthBars.fillRect(80, 5, 150 * (player.health / player.maxHealth), 20);
        healthBars.fillStyle = "black";
        healthBars.fillRect(76, 36, 158, 28);
        healthBars.fillStyle = `rgb(${255 * (1 - (this.enemy.health / this.enemy.maxHealth))}, ${255 * (this.enemy.health / this.enemy.maxHealth)}, 0)`;
        healthBars.fillRect(80, 40, 150 * (this.enemy.health / this.enemy.maxHealth), 20);
        healthBars.font = "30px monospace";
        healthBars.fillStyle = "black";
        healthBars.fillText("You: ", 0, 25);
        healthBars.font = "20px monospace";
        healthBars.fillStyle = "black";
        healthBars.fillText("Enemy: ", 0, 55);
        if (loading.innerHTML !== "") {
            return;
        }
        if (this.enemyAI) {
            this.enemyAI.update(player, this.third.scene.children.find(x => x.name === "ground"));
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
        if (this.keys.w.isDown && this.player.health > 0) {
            this.bob.x = Math.sin(time * -0.009) * 0.0075;
            this.bob.y = Math.sin(time * 0.009) * 0.0075;
            this.bob.z = Math.sin(time * 0.009) * 0.0075;
        } else {
            this.bob.x = Math.sin(time * -0.003) * 0.0075;
            this.bob.y = Math.sin(time * 0.003) * 0.0075;
            this.bob.z = Math.sin(time * 0.003) * 0.0075;
        }
        this.third.camera.position.y += this.bob.y * 1.75;
        if (this.player.health === 0) {
            this.third.camera.rotateZ(Math.PI / 2 * Math.min(framesSinceDeath / 60, 1));
        }
        if (this.sword) {
            // adjust the position of the rifle to the camera
            const raycaster = new THREE.Raycaster();
            // x and y are normalized device coordinates from -1 to +1
            raycaster.setFromCamera({ x: currXOffset - this.bob.x, y: -currYOffset - this.bob.y - (cooldown / 100) - (framesSinceDeath / 60) }, this.third.camera);
            const pos = new THREE.Vector3();
            pos.copy(raycaster.ray.direction);
            pos.multiplyScalar(1.2 + this.bob.z);
            pos.add(raycaster.ray.origin);

            this.sword.position.copy(pos);
            const rot = this.third.camera.rotation;
            this.sword.rotation.copy(rot);
            this.sword.rotateX(currXRot);
            this.sword.rotateY(currYRot);
            this.sword.rotateZ((-3 * (Math.PI / 2)) + Math.PI + 0.2);
        }
        if (this.third.scene.children.find(x => x.name === "ground")) {
            /*const groundRaycaster = new THREE.Raycaster();
            groundRaycaster.set(
                this.player.position.clone().add(new THREE.Vector3(0, 0, 0)),
                new THREE.Vector3(0, 0, 0));
            const intersects = groundRaycaster.intersectObject(this.third.scene.children.find(x => x.name === "ground"));
            console.log(intersects);*/
            const ground = this.third.scene.children.find(x => x.name === "ground");
            ground.geometry.computeBoundingBox();
            [ground.geometry.boundingBox.min.y, ground.geometry.boundingBox.min.z] = [ground.geometry.boundingBox.min.z, ground.geometry.boundingBox.min.y];
            [ground.geometry.boundingBox.max.y, ground.geometry.boundingBox.max.z] = [ground.geometry.boundingBox.max.z, ground.geometry.boundingBox.max.y];
            if (ground.geometry.boundingBox.containsPoint({
                    x: player.position.x,
                    y: player.position.y - 1.025,
                    x: player.position.z
                })) {
                canJump = true;
            }
            /*this.walls.forEach(wall => {
                wall.geometry.computeBoundingBox();
                //[wall.geometry.boundingBox.min.y, wall.geometry.boundingBox.min.z] = [wall.geometry.boundingBox.min.z, wall.geometry.boundingBox.min.y];
                //[wall.geometry.boundingBox.max.y, wall.geometry.boundingBox.max.z] = [wall.geometry.boundingBox.max.z, wall.geometry.boundingBox.max.y];
                //console.log(wall.geometry.boundingBox);
                if (wall.geometry.boundingBox.containsPoint({
                        x: player.position.x,
                        y: player.position.y - 1.025,
                        x: player.position.z
                    })) {
                    console.log("YAY")
                    canJump = true;
                }
            })*/
            if (jumpCooldown > 0) {
                canJump = false;
            }
        }
        const oldVelocity = this.player.body.velocity;
        const velocityUpdate = [oldVelocity.x, oldVelocity.y, oldVelocity.z];
        const direction = new THREE.Vector3();
        const rotation = this.third.camera.getWorldDirection(direction);
        const theta = Math.atan2(rotation.x, rotation.z);
        let speed = blocking ? 0.06 : 0.25;
        if (player.health === 0) {
            speed = 0;
        }
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
    if (e.key === " " && player && canJump && player.health > 0 && loading.innerHTML === "") {
        const oldVelocity = player.body.velocity;
        const velocityUpdate = [oldVelocity.x, oldVelocity.y, oldVelocity.z];
        velocityUpdate[1] += 5;
        player.body.setVelocity(...velocityUpdate);
        jumpCooldown = 15;
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
    enable3d(() => new Phaser.Game(config)).withPhysics('./lib')
});
document.getElementById("startGame").addEventListener("click", () => {
    document.getElementById("menu").innerHTML = "";
    loading.innerHTML = "Loading...";
    bootFunction();
});