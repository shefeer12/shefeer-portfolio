'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react';
import { cn } from '@/lib/utils';

export interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

export interface RotatingTextProps {
  texts: string[];
  transition?: Transition;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: 'first' | 'last' | 'center' | 'random' | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: 'characters' | 'words' | 'lines';
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      transition = { type: 'spring', damping: 25, stiffness: 280 },
      rotationInterval = 2500,
      staggerDuration = 0.02,
      staggerFrom = 'first',
      loop = true,
      auto = true,
      splitBy = 'characters',
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName
    },
    ref
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const next = useCallback(() => {
      setCurrentTextIndex((prevIndex) => {
        const nextIndex =
          prevIndex === texts.length - 1 ? (loop ? 0 : prevIndex) : prevIndex + 1;
        if (nextIndex !== prevIndex && onNext) {
          onNext(nextIndex);
        }
        return nextIndex;
      });
    }, [texts.length, loop, onNext]);

    const previous = useCallback(() => {
      setCurrentTextIndex((prevIndex) => {
        const prev = prevIndex === 0 ? (loop ? texts.length - 1 : prevIndex) : prevIndex - 1;
        if (prev !== prevIndex && onNext) {
          onNext(prev);
        }
        return prev;
      });
    }, [texts.length, loop, onNext]);

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        if (validIndex !== currentTextIndex) {
          setCurrentTextIndex(validIndex);
          if (onNext) onNext(validIndex);
        }
      },
      [currentTextIndex, texts.length, onNext]
    );

    const reset = useCallback(() => {
      if (currentTextIndex !== 0) {
        setCurrentTextIndex(0);
        if (onNext) onNext(0);
      }
    }, [currentTextIndex, onNext]);

    useImperativeHandle(
      ref,
      () => ({
        next,
        previous,
        jumpTo,
        reset
      }),
      [next, previous, jumpTo, reset]
    );

    useEffect(() => {
      if (!auto) return;
      const intervalId = setInterval(next, rotationInterval);
      return () => clearInterval(intervalId);
    }, [auto, rotationInterval, next]);

    const elements = useMemo(() => {
      const currentText = texts[currentTextIndex] || '';
      if (splitBy === 'characters') {
        const words = currentText.split(' ');
        return words.map((word, i) => ({
          characters: word.split(''),
          needsSpace: i !== words.length - 1
        }));
      }
      if (splitBy === 'words') {
        return currentText.split(' ').map((word, i, arr) => ({
          characters: [word],
          needsSpace: i !== arr.length - 1
        }));
      }
      return currentText.split('\n').map((line, i, arr) => ({
        characters: [line],
        needsSpace: i !== arr.length - 1
      }));
    }, [texts, currentTextIndex, splitBy]);

    const totalChars = useMemo(() => {
      return elements.reduce((sum, wordObj) => sum + wordObj.characters.length, 0);
    }, [elements]);

    const getStaggerDelay = useCallback(
      (index: number, total: number) => {
        if (staggerDuration === 0) return 0;
        if (typeof staggerFrom === 'number') {
          const distance = Math.abs(staggerFrom - index);
          return distance * staggerDuration;
        }
        switch (staggerFrom) {
          case 'first':
            return index * staggerDuration;
          case 'last':
            return (total - 1 - index) * staggerDuration;
          case 'center': {
            const center = Math.floor(total / 2);
            return Math.abs(center - index) * staggerDuration;
          }
          default:
            return index * staggerDuration;
        }
      },
      [staggerDuration, staggerFrom]
    );

    const prefersReducedMotion = useReducedMotion();

    return (
      <motion.span
        layout
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={cn('inline-flex flex-wrap whitespace-pre-wrap relative align-middle overflow-hidden', mainClassName)}
      >
        <span className="sr-only">{texts[currentTextIndex]}</span>
        {/* Overlapping popLayout prevents the badge from ever going empty between words */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={currentTextIndex}
            className={cn('inline-flex flex-wrap relative', splitLevelClassName)}
            aria-hidden="true"
          >
            {elements.map((wordObj, wordIndex, array) => {
              const previousCharsCount = array
                .slice(0, wordIndex)
                .reduce((sum, w) => sum + w.characters.length, 0);

              return (
                <span key={wordIndex} className="inline-flex whitespace-nowrap">
                  {wordObj.characters.map((char, charIndex) => (
                    <motion.span
                      key={charIndex}
                      initial={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : { y: '100%', opacity: 0, rotateX: 60 }
                      }
                      animate={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : { y: 0, opacity: 1, rotateX: 0 }
                      }
                      exit={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : { y: '-100%', opacity: 0, rotateX: -60 }
                      }
                      transition={{
                        ...transition,
                        delay: prefersReducedMotion
                          ? 0
                          : getStaggerDelay(previousCharsCount + charIndex, totalChars)
                      }}
                      className={cn('inline-block origin-bottom', elementLevelClassName)}
                    >
                      {char}
                    </motion.span>
                  ))}
                  {wordObj.needsSpace && <span className="whitespace-pre">&nbsp;</span>}
                </span>
              );
            })}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    );
  }
);

RotatingText.displayName = 'RotatingText';

export default RotatingText;
