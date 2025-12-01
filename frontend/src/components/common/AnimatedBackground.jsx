import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Floating shapes
        const shapes = [];
        const shapeCount = 15;

        for (let i = 0; i < shapeCount; i++) {
            shapes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 60 + 20,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                type: Math.floor(Math.random() * 3), // 0: square, 1: circle, 2: triangle
            });
        }

        const animate = () => {
            ctx.fillStyle = '#0E0E0E';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            shapes.forEach((shape) => {
                ctx.save();
                ctx.translate(shape.x, shape.y);
                ctx.rotate(shape.rotation);

                // Gold gradient with transparency
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, shape.size);
                gradient.addColorStop(0, 'rgba(212, 175, 55, 0.15)');
                gradient.addColorStop(1, 'rgba(212, 175, 55, 0.02)');
                ctx.fillStyle = gradient;
                ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
                ctx.lineWidth = 1;

                if (shape.type === 0) {
                    // Square
                    ctx.fillRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
                    ctx.strokeRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
                } else if (shape.type === 1) {
                    // Circle
                    ctx.beginPath();
                    ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                } else {
                    // Triangle
                    ctx.beginPath();
                    ctx.moveTo(0, -shape.size / 2);
                    ctx.lineTo(shape.size / 2, shape.size / 2);
                    ctx.lineTo(-shape.size / 2, shape.size / 2);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }

                ctx.restore();

                // Update position
                shape.x += shape.speedX;
                shape.y += shape.speedY;
                shape.rotation += shape.rotationSpeed;

                // Wrap around screen
                if (shape.x < -shape.size) shape.x = canvas.width + shape.size;
                if (shape.x > canvas.width + shape.size) shape.x = -shape.size;
                if (shape.y < -shape.size) shape.y = canvas.height + shape.size;
                if (shape.y > canvas.height + shape.size) shape.y = -shape.size;
            });

            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
            }}
        />
    );
};

export default AnimatedBackground;
