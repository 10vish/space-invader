const scoreEl = document.querySelector("span")
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
let score = 0;
canvas.height = innerHeight;
canvas.width = canvas.height * (16/9);

const game = {
  over: false,
  active: true
}

class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0
    }
    this.opacity = 1;
    this.rotation = 0;

    const image = new Image();
    image.src = "./asset/spaceship.png";

    image.onload = () => {
      const scale = 0.15;
      this.image = image;
      this.width = image.width * 0.15;
      this.height = image.height * 0.15;
      
      this.position = {
        x: canvas.width/2 - this.width/2,
        y: canvas.height - 50
      }
    }
  }

  draw() {
    // c.fillStyle = 'red';
    // c.fillRect(this.position.x, this.position.y, this.width, this.height);
    c.save();
    c.globalAlpha = this.opacity;
    c.translate(
      player.position.x + player.width/2,
      player.position.y + player.height/2
    );

    c.rotate(this.rotation);

    c.translate(
      -player.position.x - player.width/2,
      -player.position.y - player.height/2
      );

    if(this.image) {
      c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    
    c.restore();
  }

  update() {
    if(this.image) {
      this.draw();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }
}

class Invader {
  constructor({position}) {
    this.velocity = {
      x: 0,
      y: 0
    }

    const image = new Image();
    image.src = './asset/invader.png';

    image.onload = () => {
      const scale = 1;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: position.x,
        y: position.y
      }
    };
  }
    draw() { 
      c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    };

    update({velocity}) {
      if(this.image) {
        this.draw();
        this.position.x += velocity.x;
        this.position.y += velocity.y;
      }
    }
    
    shoot(invaderProjectiles) {
      invaderProjectiles.push(
      new InvaderProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height
        },
        velocity: {
          x: 0,
          y: 5
        }
      })
    )
  }
}

class Grid {
  constructor() {
    this.position = {
      x: 0,
      y: 0
    }

    this.velocity = {
      x: 3,
      y: 0
    }

    this.invaders = [];

    const rows = Math.floor(Math.random() * 10 + 2);
    const cols = Math.floor(Math.random() * 5 + 2)
    for(let x = 0; x < rows; x++) {
      for(let y = 0; y < cols; y++) {
        this.invaders.push(new Invader({
          position: {
            x: x * 30,
            y: y * 30
          }
        }));
      }
    }
    
    this.width = cols * 30;
  }

  update() {
    this.position.y += this.velocity.y;
    this.position.x += this.velocity.x;

    this.velocity.y = 0;
    if(this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 30;
    }
  }
}

class Projectile {
  constructor({position, velocity}) {
    this.position = position;
    this.velocity = velocity;

    this.radius = 4;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "red";
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class InvaderProjectile {
  constructor({position, velocity}) {
    this.position = position;
    this.velocity = velocity;

    this.width = 3;
    this.height = 10;
  }

  draw() {
    c.fillStyle = 'white';
    c.fillRect(this.position.x, this.position.y, this.width, this.height);

  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Particle {
  constructor({position, velocity, radius, color, fades = true}) {
    this.position = position;
    this.velocity = velocity;

    this.radius = radius;
    this.color = color;
    this.opacity = 1;
    this.fades = fades;
  }

  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.beginPath();

    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
    c.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if(this.fades == true) {
      this.opacity -= 0.01;
    }
  }
}

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  space: {
    pressed: false
  }
}

const player = new Player();
const projectiles = [];
const grids = [new Grid()];
const invaderProjectiles = [];
const particles = [];

let frames = 1;
let randomInterval = Math.floor((Math.random() * 1000) + 1000);

function animate() {
  if(!game.active) {
    return
  }
  requestAnimationFrame(animate);
  c.fillStyle = 'black';
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();

  particles.forEach((particle, i) => {
    
    if(particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width;
      particle.position.y = particle.radius;
    }
    
    if(particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(i, 1);
      }, 0)
    }
    else {
      particle.update();
    }
  });

  invaderProjectiles.forEach((invaderProjectile, invaderProjectileKey) => {
    if(invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
      setTimeout(() => {
        invaderProjectiles.splice(invaderProjectileKey, 1)
      });
    }
    else {
      invaderProjectile.update();
    }
    
    if(invaderProjectile.position.y + invaderProjectile.height >= player.position.y 
      && invaderProjectile.position.x + invaderProjectile.width >= player.position.x 
      && invaderProjectile.position.x <= player.position.x + player.width) {
      console.log('you loose');
      setTimeout(() => {
        player.opacity = 0;
        game.over = true
      }, 0);

      setTimeout(() => {
        game.active = false;
      }, 2000)
 
      createParticles({object: player, color: 'white'});
      return false;
    }
  })


  projectiles.forEach((projectile, key) => {
    if(projectile.position.y + projectile.radius <= 0) {
      setTimeout(() => {
        projectiles.splice(key, 1);
      }, 0)
    }
    else {
      projectile.update();
    }
  });

  grids.forEach((grid, gridIndex) => {
    grid.update();
    
    if(frames % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
    }

    grid.invaders.forEach((invader, key) => {
      invader.update({velocity: grid.velocity});

      projectiles.forEach((projectile, projKey) => {
        if(projectile.position.y - projectile.radius <= invader.position.y + invader.height 
          && projectile.position.x + projectile.radius >= invader.position.x
          && projectile.position.x - projectile.radius <= invader.position.x + invader.width
          ) {
            
          createParticles({object: invader});

          setTimeout(() => {
            const invaderFound = grid.invaders.find(invader2 => invader2 === invader);
            const projectileFound = projectiles.find(projectile2 => projectile2 === projectile);

            // remove invader and projectile
            if(invaderFound && projectileFound) {
              score += 100;
              scoreEl.innerHTML = score;
              grid.invaders.splice(key, 1);
              projectiles.splice(projKey, 1);

              if(grid.invaders.length > 0) {
                const firstInvader = grid.invaders[0];
                const lastInvader = grid.invaders[grid.invaders.length - 1];

                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                grid.position.x = firstInvader.position.x;
              }
              else {
                grids.splice(gridIndex, 1)
              }
            }
          },0)
        }
      })
    })
  });

  if(keys.a.pressed && player.position.x >= 0) {
    player.velocity.x = -5;
    player.rotation = -0.15;
  }
  else if(keys.d.pressed && player.position.x + player.width <= canvas.width) {
    player.velocity.x = 5;
    player.rotation = 0.15;
  }
  else {
    player.velocity.x = 0;
    player.rotation = 0;
  }

  if(frames % randomInterval === 0) {
    grids.push(new Grid());
    frames = 1;
    randomInterval = Math.floor(Math.random() * 1000) + 1000;
  }
 
  frames++;
}

animate();

for(let i = 0; i < 100; i++) {
  particles.push(new Particle({
    position: {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height
    },
    velocity: {
      x: 0,
      y: 0.3
    },
    radius: Math.random() * 2,
    color: "white",
    fades: false
  }))
}

function createParticles({object, color}) {
  for(let i = 0; i < 15; i++) {
      particles.push(new Particle({
        position: {
          x: object.position.x + object.width/2,
          y: object.position.y + object.height/2
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2
        },
        radius: Math.random() * 3,
        color: color || "#BAA0DE"
      }))
    }
}

addEventListener('keydown', ({key}) => {
  if(game.over) {
    return;
  }
  switch(key) {
    case 'a': 
      keys.a.pressed = true;
      break;
    case 'ArrowLeft':
      keys.a.pressed = true;
      break;
    case 'd':
      keys.d.pressed = true;
      break;
    case 'ArrowRight':
      keys.d.pressed = true;
      break;
    case ' ':
      projectiles.push(new Projectile({
        position: {
          x: player.position.x + player.width/2,
          y: player.position.y + player.height/2
        },
        velocity: {
          x: 0,
          y: -5
        }
      }));
      break;
    }
});

addEventListener('keyup', ({key}) => {
  switch(key) {
    case 'a': 
      keys.a.pressed = false;
      break;
    case 'ArrowLeft': 
      keys.a.pressed = false;
      break; 
    case 'd':
      keys.d.pressed = false;
      break;
    case 'ArrowRight':
      keys.d.pressed = false;
      break;
    case ' ':
      console.log('space bar');
      break;
  }
});