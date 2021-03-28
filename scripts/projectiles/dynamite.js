class Dynamite {
    constructor({
        scene,
        model,
        x,
        y,
        z,
        xVel,
        yVel,
        zVel,
        fromPlayer,
        antigravity,
        homing,
        lightning,
        fuse = 0
    }) {
        this.homing = homing;
        this.fromPlayer = fromPlayer;
        this.lit = -1;
        this.fuse = fuse;
        this.antigravity = antigravity;
        this.dynamite = new ExtendedObject3D();
        this.dynamite.add(model.clone());
        this.dynamite.position.set(x, y, z);
        this.dynamite.scale.set(0.25, 0.25, 0.25);
        if (lightning) {
            this.dynamite.scale.set(0.025, 0.025, 0.015);
        }
        this.dynamite.lookAt(new THREE.Vector3(x + xVel, y + yVel, z + zVel));
        this.dynamite.exploded = false;
        this.dynamite.isDynamite = true;
        this.fromPlayer = fromPlayer;
        scene.third.add.existing(this.dynamite);
        scene.third.physics.add.existing(this.dynamite, { shape: 'hull', color: 'red' });
        objects.push(this.dynamite);
        setTimeout(() => {
            this.dynamite.body.transform();
            this.dynamite.body.setFriction(1);
            this.dynamite.body.setVelocity(xVel, yVel, zVel);
            if (antigravity) {
                this.dynamite.body.setGravity(0, 0, 0)
            }
        });
        this.dynamite.body.on.collision((otherObject, event) => {
            if (((otherObject.name === "ground") && event === "collision" && !this.dynamite.exploded) ||
                (fromPlayer && otherObject === mainScene.enemy) ||
                (homing && otherObject !== mainScene.enemy && !otherObject.isArrow && !otherObject.isDynamite && event === "collision")) {
                if (this.lit === -1) {
                    this.lit = 0;
                }
            }
        });
    }
    update() {
        if (this.homing) {
            this.dynamite.body.transform();
            const angleToPlayer = Math.atan2(player.position.x - this.dynamite.position.x, player.position.z - this.dynamite.position.z);
            this.dynamite.body.setAngularVelocityY(-angleDifference(angleToPlayer, this.dynamite.body.rotation.y) * 4);
            this.dynamite.body.setVelocity(this.dynamite.body.velocity.x * 0.9 + 0.75 * Math.sin(angleToPlayer), this.dynamite.body.velocity.y + (this.dynamite.position.y < player.position.y ? 0.05 : -0.05), this.dynamite.body.velocity.z * 0.9 + 0.75 * Math.cos(angleToPlayer));
        }
        if (this.lit >= 0) {
            mainScene.smoke.emitters[0].position.x = this.dynamite.position.x;
            mainScene.smoke.emitters[0].position.y = this.dynamite.position.y;
            mainScene.smoke.emitters[0].position.z = this.dynamite.position.z;
            mainScene.smoke.emitters[0].currentEmitTime = 0;
            if (this.lit >= this.fuse) {
                this.dynamite.exploded = true;
                soundManager.dynamite.setVolume(soundManager.random(0.5, 0.75) * localProxy.sfxVolume);
                soundManager.dynamite.rate(soundManager.random(0.75, 1.25));
                soundManager.dynamite.play();
                if (this.homing) {
                    mainScene.boom.emitters[0].position.x = this.dynamite.position.x;
                    mainScene.boom.emitters[0].position.y = this.dynamite.position.y;
                    mainScene.boom.emitters[0].position.z = this.dynamite.position.z;
                    mainScene.boom.emitters[0].currentEmitTime = 0;
                } else {
                    mainScene.dynamite.emitters[0].position.x = this.dynamite.position.x;
                    mainScene.dynamite.emitters[0].position.y = this.dynamite.position.y;
                    mainScene.dynamite.emitters[0].position.z = this.dynamite.position.z;
                    mainScene.dynamite.emitters[0].currentEmitTime = 0;
                }
                this.dynamite.visible = false;
                objects.splice(objects.indexOf(this.dynamite), 1);
                projectiles.splice(projectiles.indexOf(this), 1);
                mainScene.third.physics.destroy(this.dynamite);
                mainScene.third.scene.children.splice(mainScene.third.scene.children.indexOf(this.dynamite), 1);
                dealExplodeDamage(this.dynamite.position, 25, 1.5, 6, this.fromPlayer);
            }
            this.lit++;
        }
    }
    get body() {
        return this.dynamite;
    }
}