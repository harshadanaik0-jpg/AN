import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, CheckCircle2, AlertCircle, Volume2, Trophy } from 'lucide-react';
import { LevelType, ALPHABET_DATA, NUMBERS_DATA, COLORS_DATA, ANIMALS_DATA, PLACES_DATA, Language } from '../constants';
import { speakText, translateText, translateObject } from '../services/geminiService';
import { soundService } from '../services/soundService';
import confetti from 'canvas-confetti';

interface QuizProps {
  level: LevelType;
  language: Language;
  difficulty: 'easy' | 'medium' | 'hard';
  onClose: () => void;
  onComplete: (stars: number) => void;
}

interface Question {
  id: string;
  questionText: string;
  correctAnswer: any;
  options: any[];
  type: 'text' | 'icon' | 'color';
}

export default function Quiz({ level, language, difficulty, onClose, onComplete }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [stars, setStars] = useState(0);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [translatedQuestions, setTranslatedQuestions] = useState<Question[]>([]);
  const [isTranslating, setIsTranslating] = useState(true);

  const data = useMemo(() => {
    switch (level) {
      case 'alphabets': return ALPHABET_DATA;
      case 'numbers': return NUMBERS_DATA;
      case 'colors': return COLORS_DATA;
      case 'animals': return ANIMALS_DATA;
      case 'places': return PLACES_DATA;
      default: return [];
    }
  }, [level]);

  const rawQuestions = useMemo(() => {
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    
    let questionCount = 5;
    let optionCount = 4;
    
    if (difficulty === 'easy') {
      questionCount = 3;
      optionCount = 3;
    } else if (difficulty === 'hard') {
      questionCount = 10;
      optionCount = 6;
    }

    const selected = shuffled.slice(0, questionCount);

    return selected.map((item, index) => {
      const options = [item];
      while (options.length < Math.min(optionCount, data.length)) {
        const randomItem = data[Math.floor(Math.random() * data.length)];
        if (!options.find(o => (o.letter || o.value || o.name) === (randomItem.letter || randomItem.value || randomItem.name))) {
          options.push(randomItem);
        }
      }
      return {
        id: `q-${index}`,
        questionText: getQuestionText(level, item),
        correctAnswer: item,
        options: options.sort(() => 0.5 - Math.random()),
        type: getQuestionType(level)
      } as Question;
    });
  }, [data, level, difficulty]);

  useEffect(() => {
    const translateAll = async () => {
      setIsTranslating(true);
      const translated = await Promise.all(rawQuestions.map(async (q) => {
        const text = await translateText(q.questionText, language.name);
        const options = await Promise.all(q.options.map(o => translateObject(o, language.name)));
        const correctAnswer = options.find(o => (o.letter || o.value || o.name) === (q.correctAnswer.letter || q.correctAnswer.value || q.correctAnswer.name));
        return { ...q, questionText: text, options, correctAnswer };
      }));
      setTranslatedQuestions(translated);
      setIsTranslating(false);
    };
    translateAll();
  }, [rawQuestions, language]);

  function getQuestionText(level: LevelType, item: any) {
    switch (level) {
      case 'alphabets': return `Which one starts with the letter ${item.letter}?`;
      case 'numbers': return `Which one is the number ${item.value}?`;
      case 'colors': return `Which color is ${item.name}?`;
      case 'animals': return `Where is the ${item.name}?`;
      case 'places': return `Which place is the ${item.name}?`;
      default: return '';
    }
  }

  function getQuestionType(level: LevelType): 'text' | 'icon' | 'color' {
    if (level === 'colors') return 'color';
    if (level === 'alphabets' || level === 'numbers') return 'text';
    return 'icon';
  }

  const currentQuestion = translatedQuestions[currentQuestionIndex];

  useEffect(() => {
    if (currentQuestion && !isTranslating) {
      speakText(currentQuestion.questionText, language.name);
    }
  }, [currentQuestionIndex, isTranslating, currentQuestion, language]);

  const handleOptionClick = (option: any) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const correct = (option.letter || option.value || option.name) === 
                    (currentQuestion.correctAnswer.letter || currentQuestion.correctAnswer.value || currentQuestion.correctAnswer.name);
    
    setIsCorrect(correct);
    if (correct) {
      soundService.play('success');
      setStars(s => s + 1);
      const successMsg = language.code === 'en' ? "Correct! Well done!" : "Correct!";
      translateText(successMsg, language.name).then(t => speakText(t, language.name));
      confetti({
        particleCount: 40,
        spread: 30,
        origin: { y: 0.8 },
        colors: ['#fbbf24', '#f59e0b']
      });
    } else {
      soundService.play('error');
      const failMsg = language.code === 'en' 
        ? `Not quite. The correct answer was ${currentQuestion.correctAnswer.word || currentQuestion.correctAnswer.name}.`
        : `Incorrect.`;
      translateText(failMsg, language.name).then(t => speakText(t, language.name));
    }
  };

  const nextQuestion = () => {
    soundService.play('tap');
    if (currentQuestionIndex < translatedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setQuizFinished(true);
      if (stars >= 3) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
        const winMsg = `Amazing! You earned ${stars} stars!`;
        translateText(winMsg, language.name).then(t => speakText(t, language.name));
      } else {
        const tryMsg = `Good try! You earned ${stars} stars.`;
        translateText(tryMsg, language.name).then(t => speakText(t, language.name));
      }
    }
  };

  if (isTranslating) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-16 h-16 border-8 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-2xl font-display text-indigo-600 animate-pulse">Preparing your quiz...</p>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center"
      >
        <Trophy className="w-24 h-24 text-yellow-400 mb-6 drop-shadow-lg" />
        <h2 className="text-5xl font-display text-indigo-600 mb-4">Quiz Finished!</h2>
        <div className="flex gap-2 mb-8">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-12 h-12 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'} drop-shadow-sm`} 
            />
          ))}
        </div>
        <p className="text-2xl font-bold text-slate-600 mb-8">
          You got {stars} out of {translatedQuestions.length} correct!
        </p>
        <button 
          onClick={() => onComplete(stars)}
          className="px-12 py-4 bg-indigo-600 text-white rounded-full font-bold text-xl shadow-xl hover:scale-105 transition-transform"
        >
          Finish
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl">
      <div className="w-full h-4 bg-slate-100 rounded-full mb-8 overflow-hidden">
        <motion.div 
          className="h-full bg-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${(currentQuestionIndex / translatedQuestions.length) * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between w-full mb-8">
        <h3 className="text-3xl font-display text-slate-700">{currentQuestion.questionText}</h3>
        <button 
          onClick={() => speakText(currentQuestion.questionText, language.name)}
          className="p-3 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors"
        >
          <Volume2 className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full mb-12">
        {currentQuestion.options.map((option, idx) => {
          const isThisOptionSelected = selectedOption === option;
          const isThisCorrect = (option.letter || option.value || option.name) === 
                                (currentQuestion.correctAnswer.letter || currentQuestion.correctAnswer.value || currentQuestion.correctAnswer.name);
          
          let bgColor = 'bg-white';
          let borderColor = 'border-slate-200';
          if (isAnswered) {
            if (isThisCorrect) {
              bgColor = 'bg-green-100';
              borderColor = 'border-green-500';
            } else if (isThisOptionSelected && !isCorrect) {
              bgColor = 'bg-red-100';
              borderColor = 'border-red-500';
            }
          }

          return (
            <motion.button
              key={idx}
              whileHover={!isAnswered ? { scale: 1.05 } : {}}
              whileTap={!isAnswered ? { scale: 0.95 } : {}}
              onClick={() => handleOptionClick(option)}
              className={`p-8 rounded-[2rem] border-4 ${borderColor} ${bgColor} shadow-lg flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden`}
              disabled={isAnswered}
            >
              <span className={`text-6xl md:text-8xl font-display leading-none mb-2 ${level === 'colors' ? 'drop-shadow-sm' : 'text-slate-700'}`}
                style={level === 'colors' ? { color: option.hex } : {}}
              >
                {option.letter || option.value || option.icon}
              </span>
              <span className="text-xl font-bold text-slate-500">{option.word || option.name}</span>

              {isAnswered && isThisCorrect && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              )}
              {isAnswered && isThisOptionSelected && !isCorrect && (
                <div className="absolute top-4 right-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {isAnswered && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={nextQuestion}
            className="px-12 py-4 bg-indigo-600 text-white rounded-full font-bold text-xl shadow-xl hover:scale-105 transition-transform"
          >
            {currentQuestionIndex === translatedQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
