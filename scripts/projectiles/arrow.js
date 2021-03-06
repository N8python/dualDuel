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
        pool = false
    }) {
        this.arrow = new ExtendedObject3D();
        this.arrow.add(model.clone());
        this.arrow.scale.set(0.05, 0.05, 0.125);
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
            this.arrow.body.setVelocity(xVel ? xVel : 10 * Math.sin(angle), yVel ? yVel : this.arrow.body.velocity.y + this.arrow.position.distanceTo(target.position) * 0.325 + 0.35, zVel ? zVel : 10 * Math.cos(angle));
        });
        if (pool) {
            arrowPool.push(this);
        }
        this.arrow.body.on.collision((otherObject, event) => {
            if ((otherObject.name === "ground") && event === "collision") {
                this.arrow.didDamage = true;
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
            if (blocking) {
                this.arrow.body.setVelocity(this.arrow.body.velocity.x * -0.6, this.arrow.body.velocity.y, this.arrow.body.velocity.z * -0.6);
                targetCooldown = 100;
            } else {
                if (this.target === player) {
                    playerTakeDamage(5 + Math.random() * 8, "ranged");
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
                    if (!blocked) {
                        this.target.health -= 5 + Math.random() * 8;
                        this.target.health = Math.max(this.target.health, 0);
                    }
                }
                this.arrow.body.transform();
                if (this.velocity) {
                    this.target.body.setVelocity(this.target.body.velocity.x + this.velocity.x * 0.5, this.target.body.velocity.y + this.velocity.y * 0.5, this.target.body.velocity.z + this.velocity.z * 0.5);
                } else {
                    this.target.body.setVelocity(this.target.body.velocity.x + 4 * Math.sin(this.arrow.body.rotation.y), this.target.body.velocity.y + 3, this.target.body.velocity.z + 4 * Math.cos(this.arrow.body.rotation.y));
                }
            }
        }
    }
    get body() {
        return this.arrow;
    }
}