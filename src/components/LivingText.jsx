import React, { useRef, useEffect, useState } from 'react';
import { prepareWithSegments, layoutNextLineRange, materializeLineRange } from '@chenglou/pretext';

export default function LivingText({ text, className }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({ width: entry.contentRect.width });
      }
    });
    resizeObserver.observe(containerRef.current);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    intersectionObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');

    const bodyFont = '18px "Work Sans", sans-serif';
    const lineHeight = 29.25;
    const dropCapFont = '48px "Newsreader", serif';
    const firstLetter = text.charAt(0);
    const restOfText = text.substring(1);

    ctx.font = dropCapFont;
    const dropCapWidth = ctx.measureText(firstLetter).width;
    const totalDropCapWidth = dropCapWidth + 12;
    const dropCapBottom = lineHeight * 2;

    const prepared = prepareWithSegments(restOfText, bodyFont);

    let cursor = { segmentIndex: 0, graphemeIndex: 0 };
    let y = 0;

    const wordObjects = [];
    let wordIndex = 0;

    wordObjects.push({
      text: firstLetter,
      x: 0,
      y: 0,
      sparkY: ((lineHeight - 48) / 2 + 8) - 2,
      width: dropCapWidth,
      isDropCap: true,
      index: wordIndex++
    });

    ctx.font = bodyFont;
    while (true) {
      const isNextToDropCap = y < dropCapBottom;
      const availableWidth = Math.max(50, isNextToDropCap
        ? dimensions.width - totalDropCapWidth
        : dimensions.width);

      const range = layoutNextLineRange(prepared, cursor, availableWidth);
      if (range === null) break;

      const line = materializeLineRange(prepared, range);
      const words = line.text.split(/(\s+)/);
      let currentX = isNextToDropCap ? totalDropCapWidth : 0;

      for (const wordStr of words) {
        if (!wordStr) continue;
        const width = ctx.measureText(wordStr).width;
        if (wordStr.trim().length > 0) {
          wordObjects.push({
            text: wordStr,
            x: currentX,
            y: y,
            sparkY: y + (lineHeight - 18) / 2 - 2,
            width: width,
            isDropCap: false,
            index: wordIndex++,
          });
        }
        currentX += width;
      }

      cursor = range.end;
      y += lineHeight;
    }

    const totalHeight = y;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = dimensions.width * dpr;
    canvas.height = totalHeight * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${totalHeight}px`;
    ctx.scale(dpr, dpr);

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.scale(dpr, dpr);

    let animationFrameId;
    let time = 0;
    let revealTime = 0;

    const render = () => {
      time += 0.01;
      if (isVisible) revealTime += 0.016;

      ctx.clearRect(0, 0, dimensions.width, totalHeight);
      offscreenCtx.clearRect(0, 0, dimensions.width, totalHeight);

      const HOP_DURATION = 0.28;
      const hoppingTime = Math.max(0, revealTime - 0.5);
      const currentWordFloat = hoppingTime / HOP_DURATION;
      const currentIndex = Math.floor(currentWordFloat);
      const f = currentWordFloat - currentIndex;
      const hopPhase = f < 0.4 ? 'REST' : 'HOP';

      offscreenCtx.fillStyle = '#FFFFFF';
      offscreenCtx.textBaseline = 'top';

      for (let i = 0; i < wordObjects.length; i++) {
        const word = wordObjects[i];
        let alpha = 0.15;
        let yOffset = 0;

        if (i < currentIndex) {
          alpha = 1;
        } else if (i === currentIndex) {
          alpha = 1;
          if (hopPhase === 'REST') {
            const bounceProgress = f / 0.4;
            yOffset = -Math.sin(bounceProgress * Math.PI) * 6;
          }
        } else if (i === currentIndex + 1) {
          if (hopPhase === 'HOP') {
            const hopFraction = (f - 0.4) / 0.6;
            alpha = 0.15 + 0.85 * hopFraction;
          }
        }

        offscreenCtx.globalAlpha = alpha;

        if (word.isDropCap) {
          offscreenCtx.font = dropCapFont;
          offscreenCtx.fillText(word.text, word.x, ((lineHeight - 48) / 2 + 8) + yOffset);
        } else {
          offscreenCtx.font = bodyFont;
          offscreenCtx.fillText(word.text, word.x, word.y + (lineHeight - 18) / 2 + yOffset);
        }
      }

      const cx1 = dimensions.width * 0.5 + Math.sin(time * 0.8) * 150;
      const cy1 = totalHeight * 0.5 + Math.cos(time * 0.5) * 100;
      const cx2 = dimensions.width * 0.3 + Math.cos(time * 1.2) * 100;
      const cy2 = totalHeight * 0.8 + Math.sin(time * 0.7) * 50;

      const gradient1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, 400);
      gradient1.addColorStop(0, '#D32F2F');
      gradient1.addColorStop(1, 'rgba(211, 47, 47, 0)');

      const gradient2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 300);
      gradient2.addColorStop(0, '#FFB4A9');
      gradient2.addColorStop(1, 'rgba(255, 180, 169, 0)');

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#1C1C19';
      ctx.fillRect(0, 0, dimensions.width, totalHeight);

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, dimensions.width, totalHeight);
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, dimensions.width, totalHeight);

      ctx.globalCompositeOperation = 'destination-in';
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(offscreenCanvas, 0, 0);
      ctx.restore();

      // Golden spark reader
      let sparkX = 0, sparkY = 0, sparkOpacity = 0;

      if (revealTime > 0.1 && currentIndex < wordObjects.length) {
        sparkOpacity = Math.min(1, (revealTime - 0.1) * 3);
        const safeIndex = Math.max(0, currentIndex);
        const startWord = wordObjects[safeIndex];

        if (hopPhase === 'REST' || currentIndex >= wordObjects.length - 1) {
          sparkX = startWord.x + startWord.width / 2;
          const bounceProgress = f / 0.4;
          const bounceY = (currentIndex >= wordObjects.length - 1) ? 0 : -Math.sin(bounceProgress * Math.PI) * 6;
          sparkY = startWord.sparkY + bounceY;
        } else {
          const endWord = wordObjects[safeIndex + 1];
          const hopFraction = (f - 0.4) / 0.6;
          const startX = startWord.x + startWord.width / 2;
          const startY = startWord.sparkY;
          const endX = endWord.x + endWord.width / 2;
          const endY = endWord.sparkY;
          const isLineJump = endWord.y > startWord.y;
          const jumpHeight = isLineJump ? 35 : 12;
          sparkX = startX + (endX - startX) * hopFraction;
          sparkY = startY + (endY - startY) * hopFraction - Math.sin(hopFraction * Math.PI) * jumpHeight;
        }
      } else if (currentIndex >= wordObjects.length) {
        const lastWord = wordObjects[wordObjects.length - 1];
        if (lastWord) {
          sparkX = lastWord.x + lastWord.width / 2;
          sparkY = lastWord.sparkY;
          const finishedTime = (currentWordFloat - wordObjects.length) * HOP_DURATION;
          sparkOpacity = Math.max(0, 1 - finishedTime * 1.5);
        }
      }

      if (sparkOpacity > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = sparkOpacity;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#FFFDE7';
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [text, dimensions.width, isVisible]);

  return (
    <div ref={containerRef} className={className} style={{ width: '100%', minHeight: '100px' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}
