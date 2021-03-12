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
        fromPlayer
    }) {
        this.dynamite = new ExtendedObject3D();
        this.dynamite.add(model.clone());
        this.dynamite.position.set(x, y, z);
        this.dynamite.scale.set(0.25, 0.25, 0.25);
        this.dynamite.lookAt(new THREE.Vector3(x + xVel, y + yVel, z + zVel));
        this.dynamite.exploded = false;
        this.fromPlayer = fromPlayer;
        scene.third.add.existing(this.dynamite);
        scene.third.physics.add.existing(this.dynamite, { shape: 'hull', color: 'red' });
        objects.push(this.dynamite);
        setTimeout(() => {
            this.dynamite.body.transform();
            this.dynamite.body.setFriction(0.5);
            this.dynamite.body.setVelocity(xVel, yVel, zVel);
        });
        this.dynamite.body.on.collision((otherObject, event) => {
            if (((otherObject.name === "ground") && event === "collision" && !this.dynamite.exploded) ||
                (fromPlayer && otherObject === mainScene.enemy)) {
                this.dynamite.exploded = true;
                mainScene.dynamite.emitters[0].position.x = this.dynamite.position.x;
                mainScene.dynamite.emitters[0].position.y = this.dynamite.position.y;
                mainScene.dynamite.emitters[0].position.z = this.dynamite.position.z;
                mainScene.dynamite.emitters[0].currentEmitTime = 0;
                this.dynamite.visible = false;
                objects.splice(objects.indexOf(this.dynamite), 1);
                projectiles.splice(projectiles.indexOf(this), 1);
                mainScene.third.physics.destroy(this.dynamite);
                mainScene.third.scene.children.splice(mainScene.third.scene.children.indexOf(this.dynamite), 1);
                dealExplodeDamage(this.dynamite.position, 25, 1.5, 6, this.fromPlayer);
            }
        });
    }
    update() {

    }
    get body() {
        return this.dynamite;
    }
}