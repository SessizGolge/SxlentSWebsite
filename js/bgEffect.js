const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

let t = 0;

function animate() {
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // neon fog için 3 kademeli renkli blur blob
  for (let i = 0; i < 3; i++) {
    const x =
      w / 2 +
      Math.sin(t * 0.3 + i * 2) * (w * 0.25) +
      Math.cos(t * 0.5 + i) * 80;
    const y =
      h / 2 +
      Math.cos(t * 0.2 + i * 3) * (h * 0.25) +
      Math.sin(t * 0.4 + i) * 50;

    const radius = (w + h) * 0.25;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, "hsla(280, 100%, 70%, 0.4)");
    gradient.addColorStop(1, "hsla(280, 100%, 50%, 0)");

    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = "lighter";
    ctx.fillRect(0, 0, w, h);
  }

  t += 0.007;
  requestAnimationFrame(animate);
}

animate();
