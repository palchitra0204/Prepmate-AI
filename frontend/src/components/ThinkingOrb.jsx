import { useMemo } from "react";

import "../styles/thinkingOrb.css";

const ThinkingOrb = ({
    text = "Thinking",
}) => {
    const particles = useMemo(
        () =>
            Array.from(
                { length: 80 },
                (_, index) => ({
                    id: index,

                    angle: `${index * 4.5}deg`,

                    delay: `${-(index % 20) * 0.08}s`,

                    duration: `${2.4 + (index % 7) * 0.18
                        }s`,

                    size: `${2 + (index % 4)
                        }px`,

                    distance: `${112 + (index % 9) * 3
                        }px`,
                })
            ),
        []
    );

    return (
        <div
            className="thinking-orb-wrapper"
            role="status"
            aria-live="polite"
        >
            <div className="thinking-orb">

                {/* Glow */}

                <div className="thinking-orb-glow" />


                {/* Rotating Rings */}

                <div
                    className="
            thinking-orb-ring
            thinking-orb-ring-one
          "
                />

                <div
                    className="
            thinking-orb-ring
            thinking-orb-ring-two
          "
                />

                <div
                    className="
            thinking-orb-ring
            thinking-orb-ring-three
          "
                />


                {/* Particles */}

                <div className="thinking-orb-particles">

                    {particles.map((particle) => (

                        <span
                            key={particle.id}
                            className="thinking-orb-particle"
                            style={{
                                "--particle-angle":
                                    particle.angle,

                                "--particle-delay":
                                    particle.delay,

                                "--particle-duration":
                                    particle.duration,

                                "--particle-size":
                                    particle.size,

                                "--particle-distance":
                                    particle.distance,
                            }}
                        />

                    ))}

                </div>


                {/* Center */}

                <div className="thinking-orb-centre">

                    <strong>
                        PrepMate AI
                    </strong>


                    <span className="thinking-orb-thinking">

                        {text}

                        <span className="thinking-dots">

                            <i />

                            <i />

                            <i />

                        </span>

                    </span>

                </div>

            </div>
        </div>
    );
};

export default ThinkingOrb;