// === Neon Wave Grid Background ===

const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d", { alpha: true });

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

let time = 0;

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const spacing = 50; // grid aralığı
  const waveHeight = 20; // dalga yüksekliği
  const speed = 0.015; // hız
  const glow = 15; // neon blur

  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "rgba(170, 0, 255, 0.35)"; // neon mor
  ctx.shadowColor = "rgba(200, 0, 255, 0.8)";
  ctx.shadowBlur = glow;

  // yatay çizgiler
  for (let y = 0; y < canvas.height; y += spacing) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x++) {
      const wave = Math.sin((x * 0.012) + time + y * 0.05) * waveHeight;
      ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }

  // dikey çizgiler
  for (let x = 0; x < canvas.width; x += spacing) {
    ctx.beginPath();
    for (let y = 0; y <= canvas.height; y++) {
      const wave = Math.cos((y * 0.012) + time + x * 0.05) * waveHeight;
      ctx.lineTo(x + wave, y);
    }
    ctx.stroke();
  }

  time += speed;
  requestAnimationFrame(drawGrid);
}

drawGrid();
