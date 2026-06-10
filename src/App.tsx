import { LangProvider, useTranslation } from "./i18n";
import { LanguageSwitch } from "./components/LanguageSwitch";
import { FlowChart } from "./components/FlowChart";
import { EventLog } from "./components/EventLog";
import { QuizPanel } from "./components/QuizPanel";
import { ScoreBoard } from "./components/ScoreBoard";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { CompleteScreen } from "./components/CompleteScreen";
import { ErrorBanner } from "./components/ErrorBanner";
import { useQuizApp } from "./hooks/useQuizApp";

export default function App() {
  return (
    <LangProvider>
      <Shell />
    </LangProvider>
  );
}

function Shell() {
  const { t, lang } = useTranslation();
  const { state: s, start, answer, dismissError } = useQuizApp();

  const isLoading = s.status === "thinking" && !s.isStarted;

  return (
    <div className="min-h-full flex flex-col">
      <header className="px-6 md:px-8 py-4 border-b border-zinc-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <h1 className="text-sm font-semibold text-zinc-900 tracking-tight">
            {t("nav.title")}
          </h1>
          <a
            href="https://github.com/TencentEdgeOne/langgraph-quiz-nodejs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-md p-1 text-zinc-400 transition-colors hover:text-zinc-600"
            title="GitHub"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </div>
        <LanguageSwitch />
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-[380px_1fr] items-start gap-6 p-6 md:p-8 max-w-6xl w-full mx-auto">
        <aside className="bg-white border border-zinc-200 rounded-lg p-5 flex flex-col gap-5 h-fit md:sticky md:top-6">
          <FlowChart
            currentNode={s.currentNode}
            completedNodes={s.completedNodes}
          />
          <div className="border-t border-zinc-100 pt-4">
            <EventLog
              entries={s.nodeLog}
              busy={s.isStarted && !s.finalResult && s.currentNode !== null}
            />
          </div>
        </aside>

        <section className="flex flex-col gap-4 max-w-2xl w-full">
          {s.isResuming && (
            <div className="bg-white border border-zinc-200 rounded-lg p-10 md:p-12 min-h-[480px] flex flex-col items-center justify-center gap-4 animate-fade-in">
              <span className="w-5 h-5 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin" />
              <span className="text-sm text-zinc-500">{t("quiz.resuming")}</span>
            </div>
          )}

          {!s.isResuming && !s.isStarted && (
            <WelcomeScreen onStart={() => start(lang)} loading={isLoading} />
          )}

          {s.isStarted && !s.finalResult && (
            <QuizPanel
              question={s.question}
              options={s.options}
              questionNumber={s.questionNumber}
              total={s.total}
              maxAttempts={s.maxAttempts}
              currentAttempt={s.currentAttempt}
              disabledOptions={s.disabledOptions}
              selectedOption={s.selectedOption}
              revealedCorrectOption={s.revealedCorrect}
              hintText={s.hintText}
              feedback={s.feedback}
              status={
                s.status === "idle" || s.status === "done"
                  ? "thinking"
                  : s.status
              }
              isTransitioning={s.isTransitioning}
              onSelect={answer}
            />
          )}

          {s.finalResult && (
            <CompleteScreen
              result={s.finalResult}
              onRestart={() => start(lang)}
            />
          )}

          {s.errorMessage && (
            <ErrorBanner message={s.errorMessage} onDismiss={dismissError} />
          )}
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white px-6 md:px-8 py-3">
        <ScoreBoard
          score={s.score}
          questionNumber={s.questionNumber}
          total={s.total || s.finalResult?.total || 0}
        />
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <span
      className="inline-flex w-6 h-6 rounded bg-zinc-900 items-center justify-center"
      aria-hidden
    >
      <span className="font-mono text-[10px] font-bold text-white tracking-tighter">
        LG
      </span>
    </span>
  );
}
