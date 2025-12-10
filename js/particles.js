const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

class Particle {
  constructor() { this.reset(); }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * 50; // biraz altından başlasın
    this.size = 0.8 + Math.random() * 2;
    this.speedY = 0.3 + Math.random() * 0.6;
    this.opacity = 0.2 + Math.random() * 0.5;
    this.color = `hsla(280, 100%, 60%, ${this.opacity})`;
    this.blur = 1 + Math.random() * 2;
  }

  update() {
    this.y -= this.speedY;
    this.opacity -= 0.002;

    // ekranın üstüne çıkarsa veya opaciteleri bitince yeniden başlat
    if (this.y < -10 || this.opacity <= 0) {
      this.reset();
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.shadowColor = 'purple';
    ctx.shadowBlur = this.blur;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// particle sayısı
const particles = Array.from({ length: 500 }, () => new Particle());

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animate);
}

animate();
