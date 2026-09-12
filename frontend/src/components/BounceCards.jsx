import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
    BookOpen,
    FileQuestion,
    MessageSquareText,
    Mic2,
    ArrowRight,
} from "lucide-react";

import "../styles/bounceCards.css";

gsap.registerPlugin(ScrollTrigger);

const BounceCards = ({ onStart }) => {
    const sectionRef = useRef(null);
    const cardsRef = useRef([]);

    const cards = [
        {
            icon: FileQuestion,
            number: "01",
            title: "MCQ Preparation",
            description:
                "Generate smart multiple-choice questions with answers and explanations from your study material.",
            tag: "Practice",
        },
        {
            icon: BookOpen,
            number: "02",
            title: "Question & Answers",
            description:
                "Create important short and descriptive questions with clear AI-generated answers.",
            tag: "Learn",
        },
        {
            icon: MessageSquareText,
            number: "03",
            title: "Interview Preparation",
            description:
                "Prepare topic-based interview and viva questions directly from your uploaded content.",
            tag: "Prepare",
        },
        {
            icon: Mic2,
            number: "04",
            title: "Virtual Viva",
            description:
                "Attend an interactive AI viva, answer questions one by one and receive scores and feedback.",
            tag: "Interactive",
        },
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            cardsRef.current.forEach((card, index) => {
                if (!card) return;

                gsap.fromTo(
                    card,
                    {
                        y: 110,
                        opacity: 0,
                        scale: 0.9,
                        rotate: index % 2 === 0 ? -4 : 4,
                    },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        rotate: 0,

                        duration: 0.8,
                        delay: index * 0.08,

                        ease: "back.out(1.5)",

                        scrollTrigger: {
                            trigger: card,

                            start: "top 88%",

                            end: "top 55%",

                            toggleActions: "play none none reverse",
                        },
                    }
                );
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={sectionRef}
            className="bounce-cards-wrapper"
        >
            {cards.map((card, index) => {
                const Icon = card.icon;

                return (
                    <article
                        key={card.title}
                        ref={(element) => {
                            cardsRef.current[index] = element;
                        }}
                        className="bounce-feature-card"
                    >
                        <div className="bounce-card-top">
                            <span className="bounce-card-number">
                                {card.number}
                            </span>

                            <span className="bounce-card-tag">
                                {card.tag}
                            </span>
                        </div>

                        <div className="bounce-card-icon">
                            <Icon size={28} />
                        </div>

                        <h3>{card.title}</h3>

                        <p>{card.description}</p>

                        <button
                            type="button"
                            className="bounce-card-button"
                            onClick={onStart}
                        >
                            Explore

                            <ArrowRight size={16} />
                        </button>
                    </article>
                );
            })}
        </div>
    );
};

export default BounceCards;