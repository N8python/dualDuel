class Ice {
    constructor({
        scene,
        x,
        y,
        z,
        xVel,
        yVel,
        zVel
    }) {
        this.ice = scene.third.physics.add.sphere({ radius: 0.25, x, y, z }, { lambert: { color: 0x00ffff, opacity: 0, transparent: true } });
        this.ice.body.setGravity(0, 0, 0);
        objects.push(this.ice);
        this.scene = scene;
        setTimeout(() => {
            this.ice.body.transform();
            this.ice.body.setVelocity(xVel, yVel, zVel);
            this.ice.body.setGravity(0, 0, 0)
        });
        this.tick = 0;
        this.damageCooldown = 0;
        this.ice.body.on.collision((otherObject, event) => {
            if ((otherObject === player) && event === "collision" && this.damageCooldown < 0) {
                this.damageCooldown = 10;
                /*this.arrow.didDamage = true;
                this.arrow.visible = false;
                objects.splice(objects.indexOf(this.arrow), 1);
                projectiles.splice(projectiles.indexOf(this), 1);
                mainScene.third.physics.destroy(this.arrow);
                mainScene.third.scene.children.splice(mainScene.third.scene.children.indexOf(this.arrow), 1);*/
                if (!blocking) {
                    if (player.ice < 1) {
                        player.ice = 240;
                    } else {
                        player.ice += 60;
                    }
                    playerTakeDamage(Math.random() * 10, "magic");
                } else {
                    targetCooldown = 75;
                }
            }
        });
    }
    update() {
        this.damageCooldown--;
        this.scene.ice.emitters[0].position.x = this.ice.position.x;
        this.scene.ice.emitters[0].position.y = this.ice.position.y;
        this.scene.ice.emitters[0].position.z = this.ice.position.z;
        this.scene.ice.emitters[0].currentEmitTime = 0;
        this.tick++;
        if (this.tick >= 60) {
            objects.splice(objects.indexOf(this.ice), 1);
            projectiles.splice(projectiles.indexOf(this), 1);
            mainScene.third.physics.destroy(this.ice);
            mainScene.third.scene.children.splice(mainScene.third.scene.children.indexOf(this.ice), 1);
        }
    }
    get body() {
        return this.ice;
    }
}