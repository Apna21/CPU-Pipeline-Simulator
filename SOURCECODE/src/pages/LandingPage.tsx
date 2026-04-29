import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Activity,
  GraduationCap,
  MonitorPlay,
  Sparkles,
  ArrowRight,
  BookOpen,
  PlayCircle,
  Workflow,
} from "lucide-react";
import { motion } from "framer-motion";
import { useInViewAnimation } from "@/hooks/useInViewAnimation";

const features = [
  {
    title: "Interactive pipeline",
    description: "Step through a classic 5-stage pipeline and see each instruction’s journey unfold.",
    icon: MonitorPlay,
  },
  {
    title: "Hazard visualisation",
    description: "Forwarding, stalls, and branch flushes are highlighted the moment they occur.",
    icon: Activity,
  },
  {
    title: "Guided learning path",
    description: "Structured tutorials and quizzes connect theory to hands-on experimentation.",
    icon: GraduationCap,
  },
  {
    title: "Designed for demos",
    description: "Dark-mode friendly, responsive, and built with lecturer & student feedback.",
    icon: Sparkles,
  },
];

const learningSteps = [
  {
    title: "Start with the tutorials",
    description: "Build intuition about the five stages, hazards, and metrics.",
    icon: BookOpen,
  },
  {
    title: "Investigate in the simulator",
    description: "Load curated programs or paste your own to observe pipeline behaviour.",
    icon: PlayCircle,
  },
  {
    title: "Check your understanding",
    description: "Quiz Mode loads scenarios directly into the simulator so you can verify answers.",
    icon: Workflow,
  },
];

const LandingPage = () => {
  const heroAnimation = useInViewAnimation<HTMLDivElement>();
  const featuresAnimation = useInViewAnimation<HTMLDivElement>();
  const stepsAnimation = useInViewAnimation<HTMLDivElement>();

  return (
    <main className="bg-background text-foreground">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.08),_transparent_45%)]" />
        <motion.div
          ref={heroAnimation.elementRef}
          className="container relative mx-auto px-4 py-20 md:py-28"
          initial={{ opacity: 0, y: 32 }}
          animate={heroAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold text-primary uppercase tracking-[0.24em]">
                Learn · Simulate · Reflect
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Understand CPU pipelining by <span className="text-primary">seeing it run</span>.
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Step through a five-stage pipeline, visualise hazards instantly, and pair the
                  simulator with structured learning materials and quizzes designed for active study.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="sm:w-auto" asChild>
                  <Link to="/simulator" className="flex items-center gap-2">
                    Launch Simulator
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="sm:w-auto" asChild>
                  <Link to="/quiz">Try Quiz Mode</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div>
                  <p className="text-2xl font-semibold text-foreground">5</p>
                  <p>pipeline stages instrumented</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">40+</p>
                  <p>hazard & stage insights</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">4</p>
                  <p>learning modules with quizzes</p>
                </div>
              </div>
            </div>

            <Card className="relative overflow-hidden border border-border/70 bg-muted/30 shadow-xl">
              <div className="absolute -top-32 -right-20 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -bottom-32 -left-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">What you can do here</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualise pipeline execution, explore hazard scenarios, and immediately connect
                    theory to simulation with curated learning resources.
                  </p>
                </div>
                <div className="grid gap-3 text-sm text-muted-foreground">
                  <div className="rounded-md border border-border/60 bg-background/60 px-4 py-3">
                    ✓ Adjust register &amp; memory state before each run
                  </div>
                  <div className="rounded-md border border-border/60 bg-background/60 px-4 py-3">
                    ✓ Step, play, and rewind with per-cycle hazard badges
                  </div>
                  <div className="rounded-md border border-border/60 bg-background/60 px-4 py-3">
                    ✓ Load quiz scenarios straight into the simulator
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-border bg-muted/40">
        <motion.div
          ref={featuresAnimation.elementRef}
          className="container mx-auto px-4 py-16 space-y-10"
          initial={{ opacity: 0, y: 36 }}
          animate={featuresAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold">Why learners and lecturers use it</h2>
            <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
              From introductory demos to final-year projects, the simulator emphasises clarity,
              immediate feedback, and real-time visual cues.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border border-border/60 bg-background shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/0 opacity-0 transition group-hover:opacity-100" />
                <div className="relative p-6 space-y-3">
                  <feature.icon className="w-8 h-8 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 py-16 space-y-10">
        <div className="max-w-3xl text-center mx-auto space-y-3">
          <h2 className="text-3xl font-semibold">Your guided learning loop</h2>
          <p className="text-sm text-muted-foreground">
            Follow the recommended sequence to bridge textbook theory with the interactive
            simulator. Each stage links directly to the part of the app that supports it.
          </p>
        </div>
        <motion.div
          ref={stepsAnimation.elementRef}
          className="grid gap-6 md:grid-cols-3"
          initial={{ opacity: 0, y: 36 }}
          animate={stepsAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut", staggerChildren: 0.1 }}
        >
          {learningSteps.map((step, index) => (
            <Card
              key={step.title}
              className="border border-border/60 bg-background shadow-sm p-6 space-y-3 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center gap-3 text-primary font-semibold text-sm uppercase tracking-wide">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {index + 1}
                </span>
                <step.icon className="w-5 h-5" />
                <span>Phase {index + 1}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </Card>
          ))}
        </motion.div>

        <Card className="border border-primary/40 bg-primary/10 shadow-inner p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-primary-foreground/80">
                Ready to explore hazards in action?
              </h3>
              <p className="text-sm text-primary-foreground/70">
                Jump straight into the simulator or review the stage-by-stage tutorials first—the
                entire toolkit is just one click away.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="secondary" className="sm:w-auto" asChild>
                <Link to="/simulator" className="flex items-center gap-2">
                  Open Simulator
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" className="sm:w-auto border-primary/60 text-primary" asChild>
                <Link to="/learn">Review Tutorials</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
};

export default LandingPage;


