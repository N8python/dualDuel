let arrowPool = []
class Arrow {
    constructor({
        scene,
        model,
        x,
        y,
        z,
        xVel,
        yVel,
        zVel,
        angle = 0,
        target,
        pool = false,
        speed = 10,
        bullet,
        laser
    }) {
        this.bullet = bullet;
        this.laser = laser;
        this.arrow = new ExtendedObject3D();
        this.arrow.add(model.clone());
        if (bullet) {
            this.arrow.scale.set(0.025, 0.025, 0.05);
        } else {
            this.arrow.scale.set(0.05, 0.05, 0.125);
        }
        this.arrow.rotation.y = angle;
        this.arrow.position.set(x, y, z);
        if (xVel) {
            this.arrow.lookAt(new THREE.Vector3(x + xVel, y + yVel, z + zVel));
        }
        this.arrow.didDamage = false;
        scene.third.add.existing(this.arrow);
        scene.third.physics.add.existing(this.arrow, { shape: 'concaveMesh', color: 'hotpink' });
        objects.push(this.arrow);
        setTimeout(() => {
            this.arrow.body.transform();
            this.arrow.body.setFriction(1);
            this.arrow.body.setVelocity(xVel ? xVel : speed * Math.sin(angle), yVel ? yVel : this.arrow.body.velocity.y + bullet ? (this.arrow.position.distanceTo(target.position) * (laser ? 0.2 : 0.25) + (laser ? 0.15 : 0.3)) : (this.arrow.position.distanceTo(target.position) * 0.325 + 0.35), zVel ? zVel : speed * Math.cos(angle));
        });
        if (pool) {
            arrowPool.push(this);
        }
        this.arrow.body.on.collision((otherObject, event) => {
            if ((otherObject.name === "ground" || this.laser) && event === "collision") {
                this.arrow.didDamage = true;
                this.arrow.visible = false;
                objects.splice(objects.indexOf(this.arrow), 1);
                projectiles.splice(projectiles.indexOf(this), 1);
                mainScene.third.physics.destroy(this.arrow);
                mainScene.third.scene.children.splice(mainScene.third.scene.children.indexOf(this.arrow), 1);
            }
        });
        this.target = target;
        if (xVel) {
            this.velocity = { x: xVel, y: yVel, z: zVel };
        }
    }
    update() {
        this.arrow.body.transform();
        if (this.arrow.position.distanceTo(this.target.position) < 1.5 && !this.arrow.didDamage) {
            this.arrow.didDamage = true;
            if (blocking && cooldown < 10) {
                this.arrow.body.setVelocity(this.arrow.body.velocity.x * -0.6, this.arrow.body.velocity.y, this.arrow.body.velocity.z * -0.6);
                targetCooldown = 100;
            } else {
                if (this.target === player) {
                    if (this.laser) {
                        playerTakeDamage(1 + Math.random() * 1, "ranged");
                    } else if (this.bullet) {
                        playerTakeDamage(2 + Math.random() * 4, "ranged");
                    } else {
                        playerTakeDamage(5 + Math.random() * 8, "ranged");
                    }
                } else {
                    let blocked = false;
                    if (this.target.aggro && this.target.aggroState && this.target.strafeCounter !== undefined) {
                        if (Math.random() < 0.33) {
                            this.target.animation.play("Block");
                            blocked = true;
                            setTimeout(() => {
                                this.target.animation.play("Running");
                            }, 667)
                        }
                    }
                    if (this.target.aggro && this.target.aggroState && this.target.bulletsToShoot !== undefined) {
                        if (Math.random() < 0.5) {
                            this.target.aggroState = "dodge";
                            this.target.animation.play("Dodge");
                            blocked = true;
                            setTimeout(() => {
                                this.target.aggroState = "pursue";
                                this.target.animation.play("Running");
                            }, 667)
                        }
                    }
                    if (!blocked) {
                        this.target.health -= 5 + Math.random() * 8;
                        this.target.health = Math.max(this.target.health, 0);
                    }
                }
                this.arrow.body.transform();
                if (this.velocity) {
                    this.target.body.setVelocity(this.target.body.velocity.x + this.velocity.x * 0.5 * (this.laser ? 0.33 : 1), this.target.body.velocity.y + this.velocity.y * 0.5 * (this.laser ? 0.33 : 1), this.target.body.velocity.z + this.velocity.z * 0.5 * (this.laser ? 0.33 : 1));
                } else {
                    this.target.body.setVelocity(this.target.body.velocity.x + 4 * Math.sin(this.arrow.body.rotation.y) * (this.laser ? 0.33 : 1), this.target.body.velocity.y + 3 * (this.laser ? 0.33 : 1), this.target.body.velocity.z + 4 * Math.cos(this.arrow.body.rotation.y) * (this.laser ? 0.33 : 1));
                }
            }
            this.arrow.visible = false;
            objects.splice(objects.indexOf(this.arrow), 1);
            projectiles.splice(projectiles.indexOf(this), 1);
            mainScene.third.physics.destroy(this.arrow);
            mainScene.third.scene.children.splice(mainScene.third.scene.children.indexOf(this.arrow), 1);
        }
    }
    get body() {
        return this.arrow;
    }
}