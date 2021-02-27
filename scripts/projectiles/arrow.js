let arrowPool = []
class Arrow {
    constructor({
        scene,
        model,
        x,
        y,
        z,
        angle,
        target,
        pool = false
    }) {
        this.arrow = new ExtendedObject3D();
        this.arrow.add(model.clone());
        this.arrow.scale.set(0.125, 0.05, 0.05);
        this.arrow.rotation.y = angle + Math.PI / 2;
        this.arrow.position.set(x, y, z);
        this.arrow.didDamage = false;
        scene.third.add.existing(this.arrow);
        scene.third.physics.add.existing(this.arrow, { shape: 'concaveMesh', color: 'hotpink' });
        objects.push(this.arrow);
        setTimeout(() => {
            this.arrow.body.transform();
            this.arrow.body.setFriction(1);
            this.arrow.body.setVelocity(10 * Math.sin(angle), this.arrow.body.velocity.y + this.arrow.position.distanceTo(target.position) * 0.325, 10 * Math.cos(angle));
        });
        if (pool) {
            arrowPool.push(this);
        }
        this.arrow.body.on.collision((otherObject, event) => {
            if ((otherObject.name === "ground") && event === "collision") {
                this.arrow.didDamage = true;
            }
        })
    }
    update() {
        this.arrow.body.transform();
        if (this.arrow.position.distanceTo(player.position) < 1.5 && !this.arrow.didDamage) {
            this.arrow.didDamage = true;
            if (blocking) {
                this.arrow.body.setVelocity(this.arrow.body.velocity.x * -0.6, this.arrow.body.velocity.y, this.arrow.body.velocity.z * -0.6);
                targetCooldown = 100;
            } else {
                player.health -= 5 + Math.random() * 8;
            }
        }
    }
    get body() {
        return this.arrow;
    }
}