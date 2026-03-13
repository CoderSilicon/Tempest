import { onMount, onCleanup, type Component } from "solid-js";

const Loader: Component = () => {
  let canvasRef!: HTMLCanvasElement;
  let animationFrameId: number;

  onMount(() => {
    const canvas = canvasRef;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    // --- CONFIG ---
    // Instead of thousands of dots, we use 15 "S-curved" arms
    const ARM_COUNT = 30;
    
    class CycloneArm {
      angle: number = Math.random() * Math.PI * 2;
      rotationSpeed: number = Math.random() * 0.02 + 0.01;
      opacity: number = Math.random() * 0.5 + 0.2;
      offset: number = Math.random() * 100; // Stagger the "suck in" effect

      update() {
        this.angle += 2 * this.rotationSpeed;
      }

      draw(time: number) {
        if (!ctx) return;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Example: Use time for a pulsing opacity effect (adjust formula as needed)
        const elapsed = time * 0.001; // Convert to seconds for smoother math
        const pulseOpacity = this.opacity * (0.5 + 0.5 * Math.sin(elapsed * 2)); // Sine wave for pulsing
        
        ctx.globalAlpha = pulseOpacity; // Apply to the entire drawing context
        
        // We use a loop to draw the "arm" as a series of connected points 
        // that curve more aggressively as they reach the center
        ctx.beginPath();
        for (let i = 0; i < 40; i++) {
          // As 'i' increases, we move from the outside to the inside
          const distance = (width / 2) * (1 - i / 40); 
          const spiralTwist = i * 0.15; // This creates the "Cyclone" curve
          const x = centerX + Math.cos(this.angle + spiralTwist) * distance;
          const y = centerY + Math.sin(this.angle + spiralTwist) * distance;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        ctx.globalAlpha = 1; // Reset alpha after drawing
      
        // Color styling: Outer is dark blue, inner is bright white
        const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, width / 2);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        gradient.addColorStop(0.2, "#3b82f6"); // Blue
        gradient.addColorStop(1, "rgba(30, 58, 138, 0)"); // Fades to transparent

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }

    const arms = Array.from({ length: ARM_COUNT }, () => new CycloneArm());

    const drawDiamondStar = (x: number, y: number, size: number) => {
      const armRatio = 0.2;
      const inner = size * armRatio;
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.moveTo(0, -size); ctx.lineTo(inner, -inner);
      ctx.lineTo(size, 0); ctx.lineTo(inner, inner);
      ctx.lineTo(0, size); ctx.lineTo(-inner, inner);
      ctx.lineTo(-size, 0); ctx.lineTo(-inner, -inner);
      ctx.closePath();
      
      // Pure white glow
      ctx.shadowBlur = 30;
      ctx.shadowColor = "#ffffff";
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();
    };

    const animate = (time: number) => {
      // Background zinc-950
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, width, height);

      // Draw Cyclone Arms
      arms.forEach(arm => {
        arm.update();
        arm.draw(time);
      });

      // Draw the Central Star
      const starSize = 20 + Math.sin(time / 300) * 5;
      drawDiamondStar(width / 2, height / 2, starSize);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    onCleanup(() => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    });
  });

  return (
    <div class="relative h-screen w-full overflow-hidden bg-zinc-950">
      <canvas ref={canvasRef} class="absolute inset-0 block h-full w-full" />
      
      {/* Centered logo container */}
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">

            <div class="h-12 w-12 m-3 bg-white rounded-full blur-md animate-pulse" />

      </div>
    </div>
  );
};

export { Loader };