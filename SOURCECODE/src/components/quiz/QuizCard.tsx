import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QuizQuestion } from "@/quiz/types";

interface QuizCardProps {
  question: QuizQuestion;
  index: number;
  total: number;
  onEvaluate: (questionId: string, payload: { selectedChoiceId: string; isCorrect: boolean }) => void;
  onLoadScenario?: (questionId: string) => void;
  resetSignal: number;
}

export const QuizCard = ({
  question,
  index,
  total,
  onEvaluate,
  onLoadScenario,
  resetSignal,
}: QuizCardProps) => {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const isCorrect = hasSubmitted && selectedChoiceId === question.correctChoiceId;

  const handleSubmit = () => {
    if (!selectedChoiceId) {
      setHasSubmitted(false);
      return;
    }
    const correct = selectedChoiceId === question.correctChoiceId;
    setHasSubmitted(true);
    setShowExplanation(correct);
    onEvaluate(question.id, { selectedChoiceId, isCorrect: correct });
  };

  const handleToggleExplanation = () => {
    setShowExplanation((prev) => !prev);
  };

  useEffect(() => {
    setSelectedChoiceId("");
    setHasSubmitted(false);
    setShowExplanation(false);
  }, [resetSignal]);

  return (
    <Card className="shadow-lg border border-border bg-card/90">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            {index + 1}. {question.title}
          </CardTitle>
          <Badge variant="secondary">
            Question {index + 1} of {total}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{question.prompt}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedChoiceId}
          onValueChange={(value) => {
            setSelectedChoiceId(value);
            if (hasSubmitted) {
              setHasSubmitted(false);
            }
          }}
          className="space-y-3"
        >
          {question.choices.map((choice) => (
            <div
              key={choice.id}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 transition hover:border-primary/60"
            >
              <RadioGroupItem value={choice.id} id={`${question.id}-${choice.id}`} />
              <Label htmlFor={`${question.id}-${choice.id}`} className="text-sm text-foreground leading-snug">
                {choice.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {question.hint && !hasSubmitted && (
          <p className="text-xs text-muted-foreground">Hint: {question.hint}</p>
        )}
        {question.scenario && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onLoadScenario?.(question.id)}
          >
            Load in Simulator
          </Button>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 items-stretch">
        <div className="flex items-center justify-between gap-3">
          <Button type="button" onClick={handleSubmit} disabled={!selectedChoiceId}>
            Check Answer
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleToggleExplanation}
            disabled={!hasSubmitted}
          >
            {showExplanation ? "Hide Explanation" : "Show Explanation"}
          </Button>
        </div>
        {hasSubmitted && (
          <div
            className={`rounded-lg border px-3 py-2 text-sm ${
              isCorrect
                ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-500"
                : "border-destructive/60 bg-destructive/10 text-destructive"
            }`}
          >
            {isCorrect ? "Correct! Great job." : "Not quite — try stepping through the scenario in the simulator."}
          </div>
        )}
        {hasSubmitted && showExplanation && (
          <div className="rounded-lg border border-muted-foreground/40 bg-muted/20 px-3 py-2 text-sm text-muted-foreground whitespace-pre-wrap">
            {question.explanation}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
