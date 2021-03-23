class EnemyAI {
    constructor(enemy, health) {
        this.enemy = enemy;
        this.enemy.aggro = false;
        this.enemy.health = health;
        this.enemy.maxHealth = health;
        this.enemy.dead = false;
    }
    update(target, ground) {
        this.enemy.body.transform();
        this.enemy.health = Math.max(this.enemy.health, 0);
    }
    stayUp(rigidity) {
        this.enemy.body.setAngularVelocityX(-this.enemy.body.rotation.x / rigidity);
        this.enemy.body.setAngularVelocityZ(-this.enemy.body.rotation.z / rigidity);
    }
    rotateTowards(x, z, mag = 4, offset = 0) {
        const theta = Math.atan2(x - this.enemy.position.x, z - this.enemy.position.z) + offset;
        this.enemy.body.setAngularVelocityY(-angleDifference(theta, this.enemy.body.rotation.y) * mag);
    }
    moveYDir(mag = 0.15, friction = 0.975, offset = 0) {
        this.enemy.body.setVelocity((this.enemy.body.velocity.x + mag * Math.sin(this.enemy.body.rotation.y + offset)) * friction, this.enemy.body.velocity.y, (this.enemy.body.velocity.z + mag * Math.cos(this.enemy.body.rotation.y + offset)) * friction);
    }
}