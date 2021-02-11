class EnemyAI {
    constructor(enemy) {
        this.enemy = enemy;
        this.enemy.animation.play('Idle');
        this.enemy.cooldown = 0;
        this.enemy.aggro = false;
        this.enemy.health = 100;
        this.enemy.maxHealth = 100;
        this.enemy.dead = false;
    }
    update(target, ground) {
        this.enemy.health = Math.max(this.enemy.health, 0);
        if (this.enemy.health === 0) {
            if (!this.enemy.dead) {
                this.enemy.dead = true;
                this.enemy.animation.play("D", 120, false);
            }
        }
        if (this.enemy.dead) {
            return
        }
        const raycaster = new THREE.Raycaster();
        raycaster.set(this.enemy.position.clone().add(new THREE.Vector3(2 * Math.sin(this.enemy.body.rotation.y), 1, 2 * Math.cos(this.enemy.body.rotation.y))), new THREE.Vector3(0, -Math.PI / 2, 0));
        let closeToEdge = false;
        if (raycaster.intersectObject(ground).length === 0) {
            closeToEdge = true;
        }
        raycaster.set(this.enemy.position.clone().add(new THREE.Vector3(-1 * Math.sin(this.enemy.body.rotation.y), 1, -1 * Math.cos(this.enemy.body.rotation.y))), new THREE.Vector3(0, -Math.PI / 2, 0));
        let edgeBehind = false;
        if (raycaster.intersectObject(ground).length === 0) {
            edgeBehind = true;
        }
        this.enemy.cooldown--;
        if (this.enemy.cooldown === 0) {
            if (this.enemy.position.distanceTo(target.position) > 2.5 && this.enemy.aggro) {
                this.enemy.animation.play("R");
                this.enemy.attacking = false;
            }
        }
        if ((this.enemy.position.distanceTo(target.position) < 5 || this.enemy.aggro) && !this.enemy.attacking) {
            if (!this.enemy.aggro) {
                this.enemy.animation.play("R");
            }
            this.enemy.aggro = true;
            const theta = Math.atan2(target.position.x - this.enemy.position.x, target.position.z - this.enemy.position.z);
            this.enemy.body.setVelocity((this.enemy.body.velocity.x + (edgeBehind ? 0.2 : 0.1) * Math.sin(this.enemy.body.rotation.y)) * (edgeBehind ? 0.9 : 0.975), this.enemy.body.velocity.y, (this.enemy.body.velocity.z + (edgeBehind ? 0.2 : 0.1) * Math.cos(this.enemy.body.rotation.y)) * (edgeBehind ? 0.9 : 0.975));
            //console.log(this.enemy.body);
            //console.log((theta - this.enemy.rotation.y));
            this.enemy.body.setAngularVelocityX(-this.enemy.body.rotation.x / 3);
            this.enemy.body.setAngularVelocityZ(-this.enemy.body.rotation.z / 3);
            this.enemy.body.setAngularVelocityY(-angleDifference(theta, this.enemy.body.rotation.y) * 4);
        }
        if (Math.abs(target.position.y - this.enemy.position.y) > 8) {
            if (this.enemy.aggro) {
                this.enemy.animation.play("Idle");
            }
            this.enemy.aggro = false;
            this.enemy.attacking = false;
        }
        if (this.enemy && this.enemy.body && this.enemy.position.distanceTo(target.position) < 2.5 && this.enemy.cooldown < 0) {
            if (!this.enemy.attacking) {
                this.enemy.animation.play("S");
            }
            this.enemy.attacking = true;
            this.enemy.cooldown = 90;
            setTimeout(() => {
                if (this.enemy.position.distanceTo(target.position) < 4) {
                    if (blocking && target === player) {
                        targetCooldown = 100;
                    } else {
                        target.body.setVelocity(target.body.velocity.x + 5 * Math.sin(this.enemy.body.rotation.y), target.body.velocity.y + 4, target.body.velocity.z + 5 * Math.cos(this.enemy.body.rotation.y));
                        if (target.health) {
                            target.health -= Math.floor(Math.random() * 7 + 5);
                        }
                    }
                }
            }, 500);
            /*this.enemy.animation.mixer._actions[0].setEffectiveWeight(0);
            this.enemy.animation.mixer._actions[1].setEffectiveWeight(0);
            this.enemy.animation.mixer._actions[2].setEffectiveWeight(1);*/
        }
    }
}