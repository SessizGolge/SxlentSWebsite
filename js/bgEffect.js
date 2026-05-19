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

  // White & cyan glowing effect with multiple layers for enhanced glow
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

    // Main glow layers - using white and light cyan with higher opacity
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    
    // Create multiple color stops for enhanced glow effect
    if (i === 0) {
      gradient.addColorStop(0, "hsla(0, 100%, 100%, 0.5)");    // Bright white center
      gradient.addColorStop(0.5, "hsla(180, 100%, 80%, 0.3)"); // Light cyan mid
      gradient.addColorStop(1, "hsla(180, 100%, 70%, 0)");     // Transparent
    } else if (i === 1) {
      gradient.addColorStop(0, "hsla(180, 100%, 85%, 0.4)");   // Cyan center
      gradient.addColorStop(0.6, "hsla(0, 0%, 90%, 0.2)");     // Light gray mid
      gradient.addColorStop(1, "hsla(0, 0%, 80%, 0)");         // Transparent
    } else {
      gradient.addColorStop(0, "hsla(0, 0%, 95%, 0.35)");      // Very light white
      gradient.addColorStop(0.7, "hsla(180, 100%, 75%, 0.15"); // Subtle cyan
      gradient.addColorStop(1, "hsla(180, 100%, 70%, 0)");     // Transparent
    }

    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = "lighter";
    ctx.fillRect(0, 0, w, h);
  }

  t += 0.007;
  requestAnimationFrame(animate);
}

animate();
