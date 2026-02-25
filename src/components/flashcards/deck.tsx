"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  KeyboardEventHandler,
  ReactNode,
  TouchEvent as ReactTouchEvent,
} from "react";
import type { FlashcardsDeckLabels } from "@/components/flashcards/shared";
import type { FlashcardItem } from "@/lib/flashcards";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { normalizeFlashcardPath } from "@/lib/flashcards";
import { cn } from "@/lib/utils";

type CardTransition = "idle" | "discard" | "correct";

const TRANSITION_MS = 320;
const POST_TRANSITION_LOCK_MS = 220;
const SWIPE_THRESHOLD = 88;
const SWIPE_MAX = 180;
const EXIT_X = 420;

const CARD_RESET_STATE = {
  x: 0,
  y: 0,
  rotate: 0,
  opacity: 1,
  scale: 1,
  filter: "blur(0px)",
} as const;

export interface FlashcardsSessionResult {
  passIds: Array<string>;
  confirmIds: Array<string>;
}

export function FlashcardsStudy({
  cards,
  labels,
  highlightedCardIds,
  topicTitlesBySlug,
}: {
  cards: Array<FlashcardItem>;
  labels: FlashcardsDeckLabels;
  highlightedCardIds?: Set<string>;
  topicTitlesBySlug?: Map<string, string>;
}) {
  return (
    <div className="mx-auto grid w-full max-w-4xl gap-5 md:grid-cols-2">
      {cards.map((card, index) => (
        <Card
          key={card.id}
          className={cn(
            "border-muted/70 py-4",
            highlightedCardIds?.has(card.id) &&
              "border-success/35 bg-success/5",
          )}
        >
          <CardHeader className="gap-2 px-4 pb-3">
            <div className="flex items-center gap-2">
              <CardDescription className="rounded-full border px-2 py-0.5 text-xs">
                {`#${index + 1}`}
              </CardDescription>
              <CardDescription className="truncate text-xs">
                {topicTitlesBySlug?.get(
                  normalizeFlashcardPath(card.topicSlug),
                ) ?? card.topicSlug}
              </CardDescription>
              {highlightedCardIds?.has(card.id) ? (
                <CardDescription className="text-success border-success/35 bg-success/10 rounded-full border px-2 py-0.5 text-xs">
                  {labels.passedTag}
                </CardDescription>
              ) : null}
            </div>
            <CardTitle className="text-base leading-relaxed">
              <HtmlContent>{card.question}</HtmlContent>
            </CardTitle>
          </CardHeader>

          <CardContent className="px-4 pt-0">
            <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
              {labels.answer}
            </p>
            <HtmlContent>{card.answer}</HtmlContent>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function FlashcardsInteractive({
  cards,
  labels,
  onSessionComplete,
  onViewReport,
  className,
}: {
  cards: Array<FlashcardItem>;
  labels: FlashcardsDeckLabels;
  onSessionComplete?: (result: FlashcardsSessionResult) => void;
  onViewReport?: (result: FlashcardsSessionResult) => void;
  className?: string;
}) {
  const cardsById = useMemo(
    () => new Map(cards.map((card) => [card.id, card])),
    [cards],
  );
  const completionReportedRef = useRef(false);
  const confirmedIdsRef = useRef<Array<string>>([]);
  const passIdsRef = useRef<Array<string>>([]);
  const interactionLockUntilRef = useRef(0);
  const interactionUnlockTimeoutRef = useRef<number | undefined>(undefined);
  const transitionInFlightRef = useRef(false);
  const touchTrackingRef = useRef(false);
  const touchHorizontalRef = useRef(false);
  const touchIdentifierRef = useRef<number | null>(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchLastXRef = useRef(0);
  const touchLastTsRef = useRef(0);
  const controls = useAnimationControls();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-SWIPE_MAX, 0, SWIPE_MAX], [-13, 0, 13]);
  const y = useTransform(x, (value) => -Math.abs(value) / 20);
  const scale = useTransform(x, [-SWIPE_MAX, 0, SWIPE_MAX], [1.02, 1, 1.02]);
  const discardOpacity = useTransform(x, (value) =>
    value < 0 ? Math.min(Math.abs(value) / SWIPE_THRESHOLD, 1) : 0,
  );
  const correctOpacity = useTransform(x, (value) =>
    value > 0 ? Math.min(Math.abs(value) / SWIPE_THRESHOLD, 1) : 0,
  );
  const swipeBackground = useMotionTemplate`
    linear-gradient(
      to right,
      rgba(245,158,11, calc(${discardOpacity} * 0.78)) 0%,
      rgba(245,158,11, calc(${discardOpacity} * 0.52)) 10%,
      rgba(245,158,11, calc(${discardOpacity} * 0.32)) 22%,
      rgba(245,158,11, calc(${discardOpacity} * 0.18)) 36%,
      rgba(245,158,11, calc(${discardOpacity} * 0.09)) 52%,
      rgba(245,158,11, calc(${discardOpacity} * 0.04)) 66%,
      rgba(245,158,11, calc(${discardOpacity} * 0.015)) 80%,
      rgba(245,158,11, 0) 100%
    ),
    linear-gradient(
      to left,
      rgba(34,197,94, calc(${correctOpacity} * 0.78)) 0%,
      rgba(34,197,94, calc(${correctOpacity} * 0.52)) 10%,
      rgba(34,197,94, calc(${correctOpacity} * 0.32)) 22%,
      rgba(34,197,94, calc(${correctOpacity} * 0.18)) 36%,
      rgba(34,197,94, calc(${correctOpacity} * 0.09)) 52%,
      rgba(34,197,94, calc(${correctOpacity} * 0.04)) 66%,
      rgba(34,197,94, calc(${correctOpacity} * 0.015)) 80%,
      rgba(34,197,94, 0) 100%
    )
  `;

  const [queue, setQueue] = useState(() => cards.map((card) => card.id));
  const [flipped, setFlipped] = useState(false);
  const [confirmedIds, setConfirmedIds] = useState<Array<string>>([]);
  const [passIds, setPassIds] = useState<Array<string>>([]);
  const [transition, setTransition] = useState<CardTransition>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [interactionLocked, setInteractionLocked] = useState(false);
  const [sessionNonce, setSessionNonce] = useState(0);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const springBackToRest = useCallback(
    () =>
      controls.start({
        ...CARD_RESET_STATE,
        transition: {
          type: "spring",
          stiffness: 520,
          damping: 34,
          mass: 0.7,
        },
      }),
    [controls],
  );

  const lockInteraction = (durationMs: number) => {
    interactionLockUntilRef.current = Date.now() + durationMs;
    setInteractionLocked(true);

    if (interactionUnlockTimeoutRef.current !== undefined) {
      window.clearTimeout(interactionUnlockTimeoutRef.current);
    }

    interactionUnlockTimeoutRef.current = window.setTimeout(() => {
      if (Date.now() >= interactionLockUntilRef.current) {
        setInteractionLocked(false);
      }
    }, durationMs);
  };

  useEffect(() => {
    return () => {
      if (interactionUnlockTimeoutRef.current !== undefined) {
        window.clearTimeout(interactionUnlockTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const ids = cards.map((card) => card.id);
    const nextSeed = deriveShuffleSeed(ids);
    setShuffleSeed(nextSeed);
    setQueue(shuffle(ids, nextSeed));
    setFlipped(false);
    confirmedIdsRef.current = [];
    passIdsRef.current = [];
    lockInteraction(200);
    setSessionNonce((value) => value + 1);
    setConfirmedIds([]);
    setPassIds([]);
    setTransition("idle");
    setIsDragging(false);
    transitionInFlightRef.current = false;
    x.set(0);
    controls.set(CARD_RESET_STATE);
    completionReportedRef.current = false;
  }, [cards, controls, x]);

  const total = cards.length;
  const currentId = queue[0];
  const currentCard = currentId ? cardsById.get(currentId) : undefined;
  const previewIds = queue.slice(1, 3);
  const isAnimating = transition !== "idle";

  useEffect(() => {
    if (!currentId) {
      return;
    }

    setIsDragging(false);
    x.set(0);
    controls.set(CARD_RESET_STATE);
  }, [controls, currentId, x]);

  const restart = () => {
    const ids = cards.map((card) => card.id);
    const nextSeed = advanceShuffleSeed(shuffleSeed || deriveShuffleSeed(ids));
    setShuffleSeed(nextSeed);
    setQueue(shuffle(ids, nextSeed));
    setFlipped(false);
    confirmedIdsRef.current = [];
    passIdsRef.current = [];
    lockInteraction(260);
    setSessionNonce((value) => value + 1);
    setConfirmedIds([]);
    setPassIds([]);
    setTransition("idle");
    setIsDragging(false);
    transitionInFlightRef.current = false;
    x.set(0);
    controls.set(CARD_RESET_STATE);
    completionReportedRef.current = false;
  };

  const commitCard = (
    cardId: string,
    nextTransition: Exclude<CardTransition, "idle">,
  ) => {
    if (!cardId) {
      return;
    }

    if (nextTransition === "discard") {
      const nextPassIds = [...passIdsRef.current, cardId];
      passIdsRef.current = nextPassIds;
      setPassIds(nextPassIds);
    } else {
      const nextConfirmedIds = [...confirmedIdsRef.current, cardId];
      confirmedIdsRef.current = nextConfirmedIds;
      setConfirmedIds(nextConfirmedIds);
    }

    setQueue((previous) => discardCurrent(previous));
    setFlipped(false);
    setTransition("idle");
    transitionInFlightRef.current = false;
    lockInteraction(POST_TRANSITION_LOCK_MS);
    x.set(0);
    controls.set(CARD_RESET_STATE);
  };

  const runTransition = async (
    nextTransition: Exclude<CardTransition, "idle">,
    options?: { ignoreInteractionLock?: boolean },
  ) => {
    if (
      !currentCard ||
      !currentId ||
      isAnimating ||
      transitionInFlightRef.current ||
      (!options?.ignoreInteractionLock &&
        (interactionLocked || Date.now() < interactionLockUntilRef.current))
    ) {
      return;
    }

    if (nextTransition === "correct" && !flipped) {
      return;
    }

    transitionInFlightRef.current = true;
    setTransition(nextTransition);
    setIsDragging(false);
    const transitionCardId = currentId;
    controls.stop();

    const direction = nextTransition === "discard" ? -1 : 1;
    try {
      await controls.start({
        x: direction * EXIT_X,
        y: -24,
        rotate: direction * 18,
        opacity: 0,
        scale: 0.94,
        filter: "blur(0.8px)",
        transition: {
          duration: TRANSITION_MS / 1000,
          ease: [0.22, 1, 0.36, 1],
        },
      });
    } finally {
      commitCard(transitionCardId, nextTransition);
    }
  };

  const passCard = () => {
    void runTransition("discard");
  };

  const confirmCard = () => {
    void runTransition("correct");
  };

  const onKeyboardAction: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (
      event.defaultPrevented ||
      isAnimating ||
      transitionInFlightRef.current ||
      interactionLocked ||
      !currentCard
    ) {
      return;
    }
    if (Date.now() < interactionLockUntilRef.current) {
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      setFlipped((value) => !value);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      passCard();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      confirmCard();
    }
  };
  const onDragEnd = (
    _: globalThis.MouseEvent | globalThis.TouchEvent | globalThis.PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } },
  ) => {
    if (touchHorizontalRef.current) {
      return;
    }

    if (!currentCard || isAnimating || transitionInFlightRef.current) {
      return;
    }

    setIsDragging(false);
    const projected = info.offset.x + info.velocity.x * 0.08;

    if (projected <= -SWIPE_THRESHOLD) {
      void runTransition("discard", { ignoreInteractionLock: true });
      return;
    }

    if (projected >= SWIPE_THRESHOLD) {
      if (flipped) {
        void runTransition("correct", { ignoreInteractionLock: true });
      } else {
        void springBackToRest();
        setFlipped(true);
      }

      return;
    }

    void springBackToRest();
  };

  const findTrackedTouch = (event: ReactTouchEvent<HTMLButtonElement>) => {
    const trackedId = touchIdentifierRef.current;
    if (trackedId === null) {
      return event.changedTouches.item(0);
    }

    for (let index = 0; index < event.touches.length; index += 1) {
      const touch = event.touches.item(index);
      if (touch.identifier === trackedId) {
        return touch;
      }
    }

    for (let index = 0; index < event.changedTouches.length; index += 1) {
      const touch = event.changedTouches.item(index);
      if (touch.identifier === trackedId) {
        return touch;
      }
    }

    return null;
  };

  const resetTouchTracking = () => {
    touchTrackingRef.current = false;
    touchHorizontalRef.current = false;
    touchIdentifierRef.current = null;
  };

  const onTouchStartCapture = (event: ReactTouchEvent<HTMLButtonElement>) => {
    if (!currentCard || isAnimating || transitionInFlightRef.current) {
      return;
    }

    const touch = event.changedTouches.item(0);

    touchTrackingRef.current = true;
    touchHorizontalRef.current = false;
    touchIdentifierRef.current = touch.identifier;
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchLastXRef.current = touch.clientX;
    touchLastTsRef.current = event.timeStamp;
  };

  const onTouchMoveCapture = (event: ReactTouchEvent<HTMLButtonElement>) => {
    if (
      !touchTrackingRef.current ||
      isAnimating ||
      transitionInFlightRef.current
    ) {
      return;
    }

    const touch = findTrackedTouch(event);
    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (!touchHorizontalRef.current) {
      if (absX < 10) {
        return;
      }

      if (absY > absX) {
        resetTouchTracking();
        return;
      }

      touchHorizontalRef.current = true;
    }

    event.preventDefault();
    setIsDragging(true);
    x.set(clamp(deltaX, -SWIPE_MAX, SWIPE_MAX));
    touchLastXRef.current = touch.clientX;
    touchLastTsRef.current = event.timeStamp;
  };

  const onTouchEndCapture = (event: ReactTouchEvent<HTMLButtonElement>) => {
    if (!touchTrackingRef.current) {
      return;
    }

    const touch = findTrackedTouch(event);
    if (!touch) {
      resetTouchTracking();
      return;
    }

    if (!touchHorizontalRef.current) {
      resetTouchTracking();
      return;
    }

    event.preventDefault();
    setIsDragging(false);

    const deltaX = touch.clientX - touchStartXRef.current;
    const dt = Math.max(1, event.timeStamp - touchLastTsRef.current);
    const velocityX = (touch.clientX - touchLastXRef.current) / dt;
    const projected = deltaX + velocityX * 36;

    if (projected <= -SWIPE_THRESHOLD) {
      void runTransition("discard", { ignoreInteractionLock: true });
      resetTouchTracking();
      return;
    }

    if (projected >= SWIPE_THRESHOLD) {
      if (flipped) {
        void runTransition("correct", { ignoreInteractionLock: true });
      } else {
        void springBackToRest();
        setFlipped(true);
      }

      resetTouchTracking();
      return;
    }

    void springBackToRest();

    resetTouchTracking();
  };

  const onTouchCancelCapture = () => {
    if (!touchTrackingRef.current) {
      return;
    }

    resetTouchTracking();
    setIsDragging(false);
    void springBackToRest();
  };

  useEffect(() => {
    if (
      isDragging ||
      isAnimating ||
      transitionInFlightRef.current ||
      touchTrackingRef.current
    ) {
      return;
    }

    if (Math.abs(x.get()) < 0.5) {
      return;
    }

    void springBackToRest();
  }, [isAnimating, isDragging, springBackToRest, x]);

  useEffect(() => {
    if (
      completionReportedRef.current ||
      queue.length > 0 ||
      cards.length === 0 ||
      !onSessionComplete
    ) {
      return;
    }

    const finalConfirmedIds = confirmedIdsRef.current;
    const finalPassIds = passIdsRef.current;
    if (finalConfirmedIds.length + finalPassIds.length < total) {
      return;
    }

    completionReportedRef.current = true;
    onSessionComplete({
      passIds: [...finalPassIds],
      confirmIds: [...finalConfirmedIds],
    });
  }, [cards.length, onSessionComplete, queue.length, total]);

  return (
    <motion.div
      className={cn(
        "relative z-10 mx-auto flex h-full min-h-[34rem] w-full max-w-lg flex-col overflow-visible",
        className,
      )}
      tabIndex={0}
      onKeyDown={onKeyboardAction}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{ backgroundImage: swipeBackground }}
      />

      <div className="pointer-events-none relative z-20">
        <div className="grid grid-cols-3 gap-2">
          <InfoPill
            label={labels.remaining}
            value={`${queue.length}/${total}`}
            compactOnMobile
          />
          <InfoPill
            label={labels.confirmed}
            value={passIds.length.toString()}
            warn
            compactOnMobile
          />
          <InfoPill
            label={labels.passed}
            value={confirmedIds.length.toString()}
            success
            compactOnMobile
          />
        </div>
      </div>

      <div className="relative z-10 mt-2 flex flex-1 items-center justify-center overflow-visible pb-3 sm:mt-3 sm:pb-4">
        {currentCard ? (
          <div className="relative z-10 mx-auto w-full max-w-md [perspective:1300px]">
            <div
              key={sessionNonce}
              className="relative h-[min(62svh,43rem)] min-h-[22rem] w-full overflow-visible sm:min-h-[24rem]"
            >
              {previewIds.map((id, index) => {
                const previewCard = cardsById.get(id);
                if (!previewCard) return null;

                return (
                  <div
                    key={id}
                    className={cn(
                      "border-border/55 pointer-events-none absolute inset-0 overflow-hidden rounded-[1.65rem] border bg-[linear-gradient(165deg,var(--card)_0%,color-mix(in_oklch,var(--card)_90%,var(--muted))_100%)] p-5 shadow-[0_28px_42px_-30px_rgba(0,0,0,0.7)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                      index === 0 &&
                        "z-10 translate-y-4 scale-[0.986] rotate-[0.85deg]",
                      index === 1 &&
                        "z-0 translate-y-8 scale-[0.972] -rotate-[1.1deg]",
                    )}
                    aria-hidden
                  >
                    <div className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_55%)]" />
                    <p className="text-muted-foreground relative z-10 mb-2 text-xs font-semibold tracking-wide uppercase">
                      {labels.question}
                    </p>
                    <div className="relative z-10 max-h-[7.5rem] overflow-hidden pt-[12%] sm:pt-[18%]">
                      <HtmlContent className="text-muted-foreground prose-p:my-0 prose-li:my-0 text-center">
                        {previewCard.question}
                      </HtmlContent>
                    </div>
                  </div>
                );
              })}

              <AnimatePresence initial={false} mode="popLayout">
                <motion.button
                  key={currentId}
                  type="button"
                  className={cn(
                    "absolute inset-0 z-20 block w-full cursor-grab touch-pan-y text-left select-none active:cursor-grabbing",
                    (isAnimating || transitionInFlightRef.current) &&
                      "pointer-events-none",
                  )}
                  aria-label={labels.flip}
                  disabled={isAnimating}
                  drag="x"
                  dragDirectionLock
                  dragElastic={0.16}
                  dragMomentum={false}
                  dragConstraints={{ left: -SWIPE_MAX, right: SWIPE_MAX }}
                  onTouchStartCapture={onTouchStartCapture}
                  onTouchMoveCapture={onTouchMoveCapture}
                  onTouchEndCapture={onTouchEndCapture}
                  onTouchCancelCapture={onTouchCancelCapture}
                  onDragStart={() => {
                    if (isAnimating || transitionInFlightRef.current) {
                      return;
                    }
                    setIsDragging(true);
                  }}
                  onDragEnd={onDragEnd}
                  onTap={() => {
                    if (
                      isDragging ||
                      touchHorizontalRef.current ||
                      isAnimating ||
                      transitionInFlightRef.current ||
                      interactionLocked ||
                      Date.now() < interactionLockUntilRef.current
                    ) {
                      return;
                    }
                    setFlipped((value) => !value);
                  }}
                  initial={false}
                  animate={controls}
                  whileDrag={{ cursor: "grabbing" }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  style={{ x, y, rotate, scale }}
                >
                  <motion.div
                    className="relative h-full w-full rounded-[1.8rem] [-webkit-transform-style:preserve-3d] [transform-style:preserve-3d]"
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Face
                      title={labels.question}
                      className="border-primary/35 [transform:rotateY(0deg)_translateZ(1px)]"
                      accent="question"
                    >
                      {currentCard.question}
                    </Face>
                    <Face
                      title={labels.answer}
                      className="border-success/40 [transform:rotateY(180deg)_translateZ(1px)]"
                      accent="answer"
                    >
                      {currentCard.answer}
                    </Face>
                  </motion.div>
                </motion.button>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <Card className="mx-auto w-full max-w-md py-7">
            <CardHeader className="items-center px-5 text-center">
              <CardTitle>{labels.completedTitle}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-5">
              <div className="grid grid-cols-2 gap-2">
                <InfoPill
                  label={labels.confirmed}
                  value={passIds.length.toString()}
                  warn
                  compactOnMobile
                />
                <InfoPill
                  label={labels.passed}
                  value={confirmedIds.length.toString()}
                  success
                  compactOnMobile
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="relative z-20 mt-4">
        <div className="border-border/70 bg-background/95 supports-[backdrop-filter]:bg-background/80 rounded-[1.2rem] border p-2.5 shadow-[0_18px_35px_-20px_rgba(0,0,0,0.48)] backdrop-blur">
          {currentCard ? (
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant="secondary"
                className="border-warn/45 bg-warn/20 text-warn hover:bg-warn/30 h-12 flex-col gap-1 rounded-xl border text-[10px] font-semibold shadow-[0_14px_26px_-18px_var(--warn)] active:scale-[0.985] sm:h-11 sm:flex-row sm:text-xs"
                onClick={passCard}
                disabled={isAnimating || interactionLocked}
                aria-label={labels.pass}
              >
                <ArrowLeft className="size-4" />
                <span className="leading-none">{labels.pass}</span>
              </Button>
              <Button
                type="button"
                className="border-success/60 bg-success hover:bg-success/90 h-12 flex-col gap-1 rounded-xl border text-[10px] font-semibold text-white shadow-[0_16px_30px_-18px_var(--success)] active:scale-[0.985] sm:h-11 sm:flex-row sm:text-xs"
                onClick={confirmCard}
                disabled={!flipped || isAnimating || interactionLocked}
                aria-label={labels.confirm}
              >
                <ArrowRight className="size-4" />
                <span className="leading-none">{labels.confirm}</span>
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                className="h-12 rounded-xl text-base font-semibold"
                onClick={restart}
              >
                {labels.restart}
              </Button>
              {onViewReport ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-xl text-base font-semibold"
                  onClick={() =>
                    onViewReport({
                      passIds: [...passIdsRef.current],
                      confirmIds: [...confirmedIdsRef.current],
                    })
                  }
                >
                  {labels.viewReport}
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Face({
  title,
  children,
  className,
  accent,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  accent: "question" | "answer";
}) {
  return (
    <div
      className={cn(
        "text-card-foreground absolute inset-0 flex h-full flex-col overflow-hidden rounded-[1.8rem] border p-5 shadow-[0_25px_50px_-30px_rgba(0,0,0,0.68)] [-webkit-backface-visibility:hidden] [backface-visibility:hidden]",
        accent === "question" &&
          "bg-[linear-gradient(152deg,var(--card)_0%,color-mix(in_oklch,var(--primary)_12%,var(--card))_100%)]",
        accent === "answer" &&
          "bg-[linear-gradient(152deg,var(--card)_0%,color-mix(in_oklch,var(--success)_13%,var(--card))_100%)]",
        className,
      )}
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <div className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_52%)]" />
      <p className="text-muted-foreground relative z-10 mb-3 text-xs font-semibold tracking-wide uppercase">
        {title}
      </p>
      <div className="relative z-10 min-h-0 flex-1">
        <ScrollArea
          className="h-full"
          viewportClassName={cn(
            "h-full pe-1",
            accent === "question" && "pt-[12%] sm:pt-[18%]",
          )}
        >
          <HtmlContent
            className={cn(
              "[&_b]:font-normal [&_strong]:font-normal",
              accent === "question" && "text-center",
            )}
          >
            {children}
          </HtmlContent>
        </ScrollArea>
      </div>
    </div>
  );
}

function HtmlContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-sm text-foreground/90 dark:prose-invert max-w-none",
        "[&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

function InfoPill({
  label,
  value,
  success,
  warn,
  compactOnMobile,
}: {
  label: string;
  value: string;
  success?: boolean;
  warn?: boolean;
  compactOnMobile?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card inline-flex items-center gap-2 rounded-xl border px-3 py-2.5",
        compactOnMobile &&
          "justify-center px-2 py-2 sm:justify-start sm:px-3 sm:py-2.5",
        success && "border-success/30 bg-success/5",
        warn && "border-warn/30 bg-warn/10",
      )}
    >
      <span
        className={cn(
          "text-muted-foreground text-xs font-semibold tracking-wide uppercase",
          compactOnMobile && "hidden sm:inline",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "ml-auto text-sm font-bold",
          compactOnMobile &&
            "ml-0 text-base leading-none sm:ml-auto sm:text-sm",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function discardCurrent(ids: Array<string>): Array<string> {
  if (ids.length <= 1) return [];
  return ids.slice(1);
}

function shuffle(items: Array<string>, seed: number): Array<string> {
  const result = [...items];
  const nextRandom = mulberry32(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function deriveShuffleSeed(ids: Array<string>): number {
  let hash = 0x811c9dc5;
  const joined = ids.join("|");

  for (let i = 0; i < joined.length; i += 1) {
    hash ^= joined.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  hash ^= Date.now() & 0xffffffff;
  return hash >>> 0 || 1;
}

function advanceShuffleSeed(seed: number): number {
  const next = (Math.imul(seed >>> 0, 1664525) + 1013904223) >>> 0;
  return next || 1;
}

function mulberry32(seed: number): () => number {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
