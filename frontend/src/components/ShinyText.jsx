import { useState, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
} from "motion/react";

const ShinyText = ({
  text,
  disabled = false,
  speed = 2,
  className = "",
  color = "#b5b5b5",
  shineColor = "#ffffff",
  spread = 120,
  pauseOnHover = false,
  direction = "left",
  delay = 0,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef(null);

  const animationDuration = speed * 1000;
  const delayDuration = delay * 1000;

  useAnimationFrame((time) => {
    if (disabled || isPaused) {
      lastTimeRef.current = null;
      return;
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    elapsedRef.current += deltaTime;

    const cycleDuration = animationDuration + delayDuration;
    const cycleProgress =
      (elapsedRef.current % cycleDuration) / animationDuration;

    const value = Math.min(cycleProgress, 1) * 100;

    progress.set(direction === "left" ? value : 100 - value);
  });

  const backgroundPosition = useTransform(
    progress,
    (value) => `${100 - value * 2}% center`,
  );

  return (
    <motion.span
      className={className}
      style={{
        color,
        backgroundImage: `linear-gradient(${spread}deg, ${color} 30%, ${shineColor} 50%, ${color} 70%)`,
        backgroundSize: "250% 100%",
        backgroundPosition,
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
      onMouseEnter={() => {
        if (pauseOnHover) {
          setIsPaused(true);
        }
      }}
      onMouseLeave={() => setIsPaused(false)}
    >
      {text}
    </motion.span>
  );
};

export default ShinyText;
