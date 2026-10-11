import pmMilestoneDelivery from "@/assets/images/background/pm-milestone-delivery.jpg";
import pmProjectRoadmap from "@/assets/images/background/pm-project-roadmap.jpg";
import pmTeamWorkload from "@/assets/images/background/pm-team-workload.jpg";
import { cn } from "@/utils";
import { useEffect, useState } from "react";

const SLIDES = [
	{
		id: 0,
		image: pmProjectRoadmap,
		title: "Project Roadmaps & Sprints",
		subtitle: "Visual Gantt timelines, Kanban boards, and milestone tracking",
	},
	{
		id: 1,
		image: pmTeamWorkload,
		title: "Team Capacity & Workload",
		subtitle: "Balance resource allocation, assign tasks, and prevent team burnout",
	},
	{
		id: 2,
		image: pmMilestoneDelivery,
		title: "Agile Velocity & Delivery",
		subtitle: "Real-time burndown analytics to ship high-impact deliverables",
	},
];

export function AuthShowcase() {
	const [activeSlide, setActiveSlide] = useState(0);
	const [isPaused, setIsPaused] = useState(false);

	// Auto-scroll slides smoothly every 5.5 seconds (pauses on hover)
	useEffect(() => {
		if (isPaused) return;

		const interval = setInterval(() => {
			setActiveSlide((prev) => (prev + 1) % SLIDES.length);
		}, 5500);

		return () => clearInterval(interval);
	}, [isPaused]);

	return (
		<div
			className="relative hidden lg:flex flex-col justify-end overflow-hidden h-full w-full select-none"
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
		>
			{/* Horizontal Scrolling Carousel Track with Smooth Transition */}
			<div
				className="absolute inset-0 flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
				style={{ transform: `translateX(-${activeSlide * 100}%)` }}
			>
				{SLIDES.map((slide) => (
					<div key={slide.id} className="relative h-full w-full min-w-full shrink-0 overflow-hidden">
						<img
							src={slide.image}
							alt={slide.title}
							className="h-full w-full object-cover object-center pointer-events-none"
						/>
					</div>
				))}
			</div>

			{/* Light blue tint and gradient shade overlay */}
			<div className="absolute inset-0 bg-blue-600/15 mix-blend-color pointer-events-none z-1" />
			<div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-blue-950/35 to-sky-500/15 pointer-events-none z-2" />

			{/* Content overlay with smooth slide-in transition */}
			<div className="relative z-10 p-10 xl:p-12 flex items-end justify-between w-full">
				<div className="relative h-20 w-full max-w-lg overflow-hidden">
					{SLIDES.map((slide, index) => (
						<div
							key={slide.id}
							className={cn(
								"absolute inset-0 flex flex-col justify-end space-y-1.5 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]",
								activeSlide === index
									? "opacity-100 translate-x-0"
									: activeSlide > index
										? "opacity-0 -translate-x-12 pointer-events-none"
										: "opacity-0 translate-x-12 pointer-events-none",
							)}
						>
							<h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-white drop-shadow-md">{slide.title}</h2>
							<p className="text-sm xl:text-base font-medium text-white/90 drop-shadow-md">{slide.subtitle}</p>
						</div>
					))}
				</div>

				{/* Clickable Carousel indicator dashes (— - -) */}
				<div className="flex items-center gap-1.5 pb-2 shrink-0 z-20">
					{SLIDES.map((slide, index) => (
						<button
							key={slide.id}
							type="button"
							aria-label={`Go to slide ${index + 1}`}
							onClick={() => setActiveSlide(index)}
							className={cn(
								"h-1.5 rounded-full transition-all duration-300 cursor-pointer",
								activeSlide === index ? "w-7 bg-white shadow-sm" : "w-2.5 bg-white/50 hover:bg-white/80",
							)}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default AuthShowcase;
