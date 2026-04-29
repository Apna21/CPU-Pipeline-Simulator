import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { QuizCard } from "@/components/quiz/QuizCard";
import { quizModules } from "@/quiz/quizData";
import { QuizScenario } from "@/quiz/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight, GraduationCap, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useInViewAnimation } from "@/hooks/useInViewAnimation";

type QuizResponse = {
  selectedChoiceId: string;
  isCorrect: boolean;
};

export const QuizPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [responses, setResponses] = useState<Record<string, QuizResponse>>({});
  const [resetCounter, setResetCounter] = useState(0);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() =>
    quizModules.reduce<Record<string, boolean>>((acc, module, index) => {
      acc[module.id] = index === 0;
      return acc;
    }, {})
  );

  const totalQuestions = useMemo(
    () => quizModules.reduce((acc, module) => acc + module.questions.length, 0),
    []
  );
  const answeredCount = Object.keys(responses).length;
  const score = useMemo(
    () => Object.values(responses).filter((response) => response.isCorrect).length,
    [responses]
  );

  const handleEvaluate = (questionId: string, payload: QuizResponse) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: payload,
    }));
  };

  const handleLoadScenario = (questionId: string) => {
    const question = quizModules
      .flatMap((module) => module.questions)
      .find((q) => q.id === questionId);
    if (!question?.scenario) {
      return;
    }
    const scenario: QuizScenario = question.scenario;
    navigate("/simulator", {
      state: {
        scenario,
        source: "quiz",
      },
    });
    toast({
      title: "Launching Simulator",
      description: `Loaded "${question.title}" into the simulator.`,
    });
  };

  const handleResetProgress = () => {
    setResponses({});
    setResetCounter((prev) => prev + 1);
  };

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const heroAnimation = useInViewAnimation<HTMLDivElement>();
  const modulesAnimation = useInViewAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <div className="bg-background text-foreground min-h-[calc(100vh-120px)]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.1),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.06),_transparent_45%)]" />
        <motion.div
          ref={heroAnimation.elementRef}
          className="relative container mx-auto px-4 py-16 space-y-8"
          initial={{ opacity: 0, y: 24 }}
          animate={heroAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <header className="max-w-3xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold text-primary uppercase tracking-[0.3em]">
              Knowledge Check
            </span>
            <h1 className="text-4xl font-bold leading-tight">
              Test your pipeline intuition with{" "}
              <span className="text-primary">scenarios you can run</span>.
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Each question links to a ready-made simulator program so you can verify your answer by
              stepping through the pipeline. Explore hazards, monitor registers, and build confidence.
            </p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-4 py-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>Total score: {score} / {totalQuestions}</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-4 py-2">
                <Target className="w-4 h-4 text-primary" />
                <span>Answered: {answeredCount} / {totalQuestions}</span>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={handleResetProgress}>
                Reset Progress
              </Button>
            </div>
          </header>

          <Card className="border border-border/70 bg-muted/20 shadow-inner p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-primary">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold uppercase tracking-wide text-xs">How it works</span>
                </div>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  Choose a module, answer the questions, and click &ldquo;Load in Simulator&rdquo; to
                  inspect the program that prompted the quiz. Use step, play, and back to explore pipeline
                  behaviour before checking your answer.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/learn">Review Tutorials</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/simulator">Open Simulator</Link>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 pb-16 space-y-10">
        <motion.div
          ref={modulesAnimation.elementRef}
          className="space-y-10"
          initial={{ opacity: 0, y: 24 }}
          animate={modulesAnimation.isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {quizModules.map((module) => {
          const moduleResponses = module.questions
            .map((question) => responses[question.id])
            .filter((response): response is QuizResponse => Boolean(response));
          const moduleAnswered = moduleResponses.length;
          const moduleScore = moduleResponses.filter((response) => response.isCorrect).length;
          const moduleProgressValue =
            moduleAnswered > 0
              ? (moduleAnswered / module.questions.length) * 100
              : 0;
          const isOpen = openModules[module.id];
          return (
            <Card
              key={module.id}
              className="border border-border/70 bg-card/80 shadow-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleModule(module.id)}
                className="w-full text-left px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-background/60 backdrop-blur transition duration-200 hover:bg-muted/40"
              >
                <div className="flex items-center gap-3 text-left">
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{module.title}</h3>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                      {module.description}
                    </p>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {module.questions.length}
                      </span>
                      <span>questions inspired by {module.tutorialSection}</span>
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-80 space-y-2">
                  <Progress value={moduleProgressValue} />
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>
                      Answered {moduleAnswered} / {module.questions.length}
                    </span>
                    <span>Score {moduleScore}</span>
                  </div>
                </div>
              </button>
              {isOpen && (
                <div className="px-6 pb-6 grid gap-6">
                  {module.questions.map((question, index) => (
                    <QuizCard
                      key={`${question.id}-${resetCounter}`}
                      question={question}
                      index={index}
                      total={module.questions.length}
                      onEvaluate={handleEvaluate}
                      onLoadScenario={handleLoadScenario}
                      resetSignal={resetCounter}
                    />
                  ))}
                </div>
              )}
            </Card>
          );
        })}
        </motion.div>
      </section>
    </div>
  );
};

export default QuizPage;
