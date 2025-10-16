import React, { useRef, useEffect } from 'react';
import { useAlert } from '../contexts/AppContext';

const DataWeaveBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { globalAlert } = useAlert();
    const isCritical = globalAlert?.level === 'CRITICAL';

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        window.addEventListener('resize', resize);
        resize();

        const particles: { x: number, y: number, speed: number, baseSpeed: number }[] = [];
        const particleCount = 150;

        for (let i = 0; i < particleCount; i++) {
            const speed = Math.random() * 0.5 + 0.1;
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: speed,
                baseSpeed: speed,
            });
        }

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Determine color and speed based on alert state
            const particleColor = isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.1)';
            ctx.fillStyle = particleColor;
            
            particles.forEach(p => {
                p.speed = isCritical ? p.baseSpeed * 10 : p.baseSpeed;
                p.y -= p.speed;
                if (p.y < 0) {
                    p.y = canvas.height;
                    p.x = Math.random() * canvas.width;
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
        };
    }, [isCritical]);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 transition-opacity duration-500" style={{opacity: isCritical ? 0.75 : 0.5}} />;
};

export default DataWeaveBackground;
