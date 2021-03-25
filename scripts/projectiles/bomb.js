class Bomb {
    constructor({
        scene,
        model,
        x,
        y,
        z,
        xVel,
        yVel,
        zVel,
        tick = 0
    }) {
        this.bomb = new ExtendedObject3D();
        this.bomb.add(model.clone());
        this.bomb.position.set(x, y, z);
        this.bomb.scale.set(0.00125, 0.00125, 0.00125);
        this.bomb.lookAt(new THREE.Vector3(x + xVel, y + yVel, z + zVel));
        this.bomb.tick = tick;
        this.bomb.exploded = false;
        scene.third.add.existing(this.bomb);
        scene.third.physics.add.existing(this.bomb, { shape: 'hull', color: 'black' });
        objects.push(this.bomb);
        setTimeout(() => {
            this.bomb.body.transform();
            this.bomb.body.setVelocity(xVel, yVel, zVel);
        });
    }
    update() {
        this.bomb.tick++;
        if (this.bomb.tick > 60) {
            mainScene.smoke.emitters[0].position.x = this.bomb.position.x;
            mainScene.smoke.emitters[0].position.y = this.bomb.position.y;
            mainScene.smoke.emitters[0].position.z = this.bomb.position.z;
            mainScene.smoke.emitters[0].currentEmitTime = 0;
        }
        if (this.bomb.tick === 120) {
            soundManager.explosion.setVolume(soundManager.random(0.1, 0.15) * localProxy.sfxVolume);
            soundManager.explosion.rate(soundManager.random(0.75, 1.25));
            soundManager.explosion.play();
            mainScene.explosion.emitters[0].position.x = this.bomb.position.x;
            mainScene.explosion.emitters[0].position.y = this.bomb.position.y;
            mainScene.explosion.emitters[0].position.z = this.bomb.position.z;
            mainScene.explosion.emitters[0].currentEmitTime = 0;
            this.bomb.visible = false;
            objects.splice(objects.indexOf(this.bomb), 1);
            projectiles.splice(projectiles.indexOf(this), 1);
            mainScene.third.physics.destroy(this.bomb);
            mainScene.third.scene.children.splice(mainScene.third.scene.children.indexOf(this.bomb), 1);
            dealExplodeDamage(this.bomb.position, 50, 1.5, 8);
        }
    }
}