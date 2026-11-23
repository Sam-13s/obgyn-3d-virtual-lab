import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react";
import api, { refreshCsrf } from "./api.js";

export default function AssessmentPage({ onAttemptSaved }) {
  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [theoryAnswers, setTheoryAnswers] = useState(Array(10).fill(""));
  const [result, setResult] = useState(null);
  const [section, setSection] = useState("objective");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadAssignment = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/quiz/questions/");
      setAssignment(data);
      setAnswers({});
      setTheoryAnswers(Array(data.theory.length).fill(""));
      setResult(null);
      setSection("objective");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Assignment questions could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAssignment(); }, [loadAssignment]);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await refreshCsrf();
      const { data } = await api.post("/quiz/submit/", { objective_answers: answers, theory_answers: theoryAnswers });
      setResult(data);
      onAttemptSaved?.();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.response?.data?.answers || "Your assignment could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const objective = assignment?.objective || [];
  const theory = assignment?.theory || [];
  const objectiveComplete = Object.keys(answers).length === objective.length;
  const theoryComplete = theoryAnswers.length === 10 && theoryAnswers.every((answer) => answer.trim().length >= 10);
  const readyToSubmit = objectiveComplete && theoryComplete;
  const resultByQuestion = new Map((result?.results || []).map((item) => [item.question_id, item]));

  return <section className="utility-page assessment-page">
    <div className="utility-heading"><span className="section-kicker">ASSIGNMENT · SAVED TO YOUR LEARNING RECORD</span><h1>OB-GYN Assignment</h1><p>Complete 30 objective questions and 10 written theory questions. Objective responses are scored automatically; theory responses are saved with your submission for review.</p></div>
    {loading ? <div className="assessment-card assessment-state"><LoaderCircle className="assessment-spinner" size={20} />Loading a fresh assignment…</div> : error && !assignment ? <div className="assessment-card assessment-state" role="alert">{error}<button type="button" className="assessment-reset" onClick={loadAssignment}>Retry</button></div> : assignment && <>
      <div className="assessment-tabs" role="tablist" aria-label="Assignment sections">
        <button type="button" role="tab" aria-selected={section === "objective"} className={section === "objective" ? "active" : ""} onClick={() => setSection("objective")}>Objective <span>{Object.keys(answers).length}/{objective.length}</span></button>
        <button type="button" role="tab" aria-selected={section === "theory"} className={section === "theory" ? "active" : ""} onClick={() => setSection("theory")}>Theory <span>{theoryAnswers.filter((answer) => answer.trim().length >= 10).length}/{theory.length}</span></button>
      </div>

      {section === "objective" ? objective.map((question, index) => {
        const savedResult = resultByQuestion.get(question.id);
        return <article className="assessment-question" key={question.id}>
          <span>OBJECTIVE {String(index + 1).padStart(2, "0")} / 30</span>
          <h2>{question.question}</h2>
          <div className="assessment-options">{question.options.map((option, optionIndex) => {
            const selected = answers[question.id] === optionIndex;
            const correct = savedResult?.correct_index === optionIndex;
            const incorrectChoice = result && selected && !savedResult?.is_correct;
            return <button type="button" key={`${question.id}-${optionIndex}`} disabled={Boolean(result) || busy} className={correct ? "correct" : incorrectChoice ? "incorrect" : selected ? "chosen" : ""} onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}>
              <span>{String.fromCharCode(65 + optionIndex)}</span>{option}{correct && result && <CheckCircle2 size={16} />}
            </button>;
          })}</div>
          {savedResult && <p className="assessment-explanation">{savedResult.explanation} {question.source_url && <a href={question.source_url} target="_blank" rel="noreferrer">Reference</a>}</p>}
        </article>;
      }) : theory.map((item, index) => <article className="assessment-question theory-question" key={item.id}>
        <span>THEORY {String(index + 1).padStart(2, "0")} / 10</span>
        <h2>{item.question}</h2>
        <textarea aria-label={`Theory answer ${index + 1}`} disabled={Boolean(result) || busy} value={theoryAnswers[index] || ""} onChange={(event) => setTheoryAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? event.target.value : answer))} placeholder="Write your answer (at least 10 characters)…" rows={5} />
      </article>)}

      {error && <div className="assessment-error" role="alert">{error}</div>}
      <div className="assessment-submit-row">{result ? <><b>Objective score: {result.score}/30 ({result.percentage}%) · 10 theory answers saved</b><button type="button" className="assessment-reset" onClick={loadAssignment}><RotateCcw size={14} /> New assignment</button></> : <><span>{objectiveComplete ? "30/30 objective" : `${Object.keys(answers).length}/30 objective`} · {theoryComplete ? "10/10 theory complete" : `${theoryAnswers.filter((answer) => answer.trim().length >= 10).length}/10 theory ready`}</span><button type="button" className="assessment-submit" disabled={busy || !readyToSubmit} onClick={submit}>{busy ? "Saving assignment…" : "Submit assignment"}</button></>}</div>
      {assignment.references?.length > 0 && <div className="assignment-references"><b>Learning references</b>{assignment.references.map((reference) => <a key={reference.url} href={reference.url} target="_blank" rel="noreferrer">{reference.title}</a>)}<small>Questions are drawn randomly from a reviewed question bank linked to these public references. The references themselves may be updated by their publishers.</small></div>}
    </>}
  </section>;
}
