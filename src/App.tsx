/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, X, Sparkles, ChevronLeft, ChevronRight, 
  Lock, Trophy, Home, PenTool, BookOpen, PartyPopper,
  Gamepad2, Star, Languages, Settings, Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  ALPHABET_DATA, NUMBERS_DATA, COLORS_DATA, ANIMALS_DATA, PLACES_DATA,
  LEVELS, LevelType, AlphabetItem, SUPPORTED_LANGUAGES, Language 
} from './constants';
import { speakText, generateLetterImage, translateText, translateObject } from './services/geminiService';
import { soundService } from './services/soundService';
import TracingCanvas from './components/TracingCanvas';
import Quiz from './components/Quiz';

export default function App() {
  const [currentLevel, setCurrentLevel] = useState<LevelType | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState<LevelType[]>(['alphabets']);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemImage, setItemImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [showTracing, setShowTracing] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [totalStars, setTotalStars] = useState(0);
  const [language, setLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [animationIntensity, setAnimationIntensity] = useState(1);
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedLevels, setTranslatedLevels] = useState(LEVELS);
  const [translatedData, setTranslatedData] = useState<any[]>([]);
  const [uiStrings, setUiStrings] = useState({
    title: 'AlphaLearn',
    subtitle: 'Pick a level to start your adventure!',
    mainMenu: 'Main Menu',
    takeQuiz: 'Take a Quiz',
    practiceWriting: 'Practice Writing',
    magicDrawing: 'Magic drawing in progress...',
    traceTitle: 'Trace the Letter',
    excellentWriting: 'Excellent writing!',
    unlockedMsg: 'Great job! You unlocked',
    tracingProgress: 'Tracing Progress',
    settings: 'Settings',
    volume: 'Sound Volume',
    animations: 'Animation Fun',
    difficulty: 'Quiz Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    save: 'Save & Close'
  });

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('alphaLearnProgress');
    if (saved) {
      const { unlocked, completed, stars, langCode, volume: savedVol, anim, diff } = JSON.parse(saved);
      setUnlockedLevels(unlocked || ['alphabets']);
      setCompletedItems(completed || []);
      setTotalStars(stars || 0);
      if (langCode) {
        const foundLang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
        if (foundLang) setLanguage(foundLang);
      }
      if (savedVol !== undefined) {
        setVolume(savedVol);
        soundService.setVolume(savedVol);
      }
      if (anim !== undefined) setAnimationIntensity(anim);
      if (diff !== undefined) setQuizDifficulty(diff);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('alphaLearnProgress', JSON.stringify({
      unlocked: unlockedLevels,
      completed: completedItems,
      stars: totalStars,
      langCode: language.code,
      volume,
      anim: animationIntensity,
      diff: quizDifficulty
    }));
  }, [unlockedLevels, completedItems, totalStars, language, volume, animationIntensity, quizDifficulty]);

  // Translation Effect
  useEffect(() => {
    const translateUI = async () => {
      setIsTranslating(true);
      try {
        const newUiStrings = await translateObject(uiStrings, language.name);
        setUiStrings(newUiStrings);

        const newLevels = await Promise.all(LEVELS.map(l => translateObject(l, language.name)));
        setTranslatedLevels(newLevels);
      } catch (e) {
        console.error("UI Translation failed", e);
      } finally {
        setIsTranslating(false);
      }
    };
    translateUI();
  }, [language]);

  useEffect(() => {
    if (currentLevel) {
      const translateLevelData = async () => {
        setIsTranslating(true);
        try {
          const rawData = getLevelData(currentLevel);
          const newData = await Promise.all(rawData.map(item => translateObject(item, language.name)));
          setTranslatedData(newData);
        } catch (e) {
          console.error("Data Translation failed", e);
        } finally {
          setIsTranslating(false);
        }
      };
      translateLevelData();
    }
  }, [currentLevel, language]);

  const handleItemClick = (item: any) => {
    soundService.play('tap');
    setSelectedItem(item);
    setShowTracing(false);
    const textToSpeak = item.letter 
      ? `${item.letter} is for ${item.word}` 
      : item.value 
        ? `${item.value}. ${item.word}`
        : item.name;
    speakText(textToSpeak, language.name);
  };

  useEffect(() => {
    if (selectedItem) {
      setIsLoadingImage(true);
      setItemImage(null);
      generateLetterImage(selectedItem.imagePrompt).then((url) => {
        setItemImage(url);
        setIsLoadingImage(false);
      });
    }
  }, [selectedItem]);

  const markCompleted = (id: string) => {
    if (!completedItems.includes(id)) {
      const newCompleted = [...completedItems, id];
      setCompletedItems(newCompleted);

      // Check if level is finished to unlock next
      const currentLevelData = getLevelData(currentLevel!);
      const isLevelFinished = currentLevelData.every(item => 
        newCompleted.includes(getItemKey(item))
      );

      if (isLevelFinished) {
        const nextLevelIndex = LEVELS.findIndex(l => l.id === currentLevel) + 1;
        if (nextLevelIndex < LEVELS.length) {
          const nextLevelId = LEVELS[nextLevelIndex].id;
          if (!unlockedLevels.includes(nextLevelId)) {
            setUnlockedLevels([...unlockedLevels, nextLevelId]);
            soundService.play('levelUp');
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#6366f1', '#f43f5e', '#10b981', '#f59e0b']
            });
            speakText(`${uiStrings.unlockedMsg} ${translatedLevels[nextLevelIndex].title}!`, language.name);
          }
        }
      }
    }
  };

  const getItemKey = (item: any) => item.letter || item.value || item.name;

  const getLevelData = (type: LevelType) => {
    switch(type) {
      case 'alphabets': return ALPHABET_DATA;
      case 'numbers': return NUMBERS_DATA;
      case 'colors': return COLORS_DATA;
      case 'animals': return ANIMALS_DATA;
      case 'places': return PLACES_DATA;
      default: return [];
    }
  };

  const renderMainMenu = () => (
    <div className="flex flex-col items-center w-full">
      {/* Language Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-4xl px-4">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <motion.button
            key={lang.code}
            whileHover={{ scale: 1 + (0.05 * animationIntensity) }}
            whileTap={{ scale: 1 - (0.05 * animationIntensity) }}
            onClick={() => {
              soundService.play('tap');
              setLanguage(lang);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all shadow-sm
              ${language.code === lang.code ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full px-4">
        {translatedLevels.map((level, index) => {
          const isUnlocked = unlockedLevels.includes(level.id);
          return (
            <motion.div
              key={level.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={isUnlocked ? { 
                scale: 1 + (0.05 * animationIntensity),
                y: -5 * animationIntensity,
                transition: { type: "spring", stiffness: 300, damping: 15 }
              } : {}}
              whileTap={isUnlocked ? { scale: 1 - (0.05 * animationIntensity) } : {}}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                if (isUnlocked) {
                  soundService.play('tap');
                  setCurrentLevel(level.id);
                } else {
                  soundService.play('error');
                }
              }}
              className={`relative p-8 rounded-[2.5rem] shadow-xl cursor-pointer transition-all duration-300 overflow-hidden group
                ${isUnlocked ? `${level.color}` : 'bg-slate-200 grayscale cursor-not-allowed'}`}
            >
              <div className="flex flex-col items-center text-center gap-4 relative z-10">
                <motion.span 
                  animate={isUnlocked ? {
                    y: [0, -8 * animationIntensity, 0],
                    rotate: [0, -5 * animationIntensity, 5 * animationIntensity, 0]
                  } : {}}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-7xl mb-2 drop-shadow-lg inline-block"
                >
                  {level.icon}
                </motion.span>
                <h3 className="font-display text-3xl text-white">{level.title}</h3>
                <p className="text-white/80 font-medium">{level.description}</p>
              </div>
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                  <Lock className="w-12 h-12 text-slate-400" />
                </div>
              )}
              <div className="absolute -bottom-6 -right-6 text-white/10 text-9xl font-display rotate-12 group-hover:rotate-0 transition-transform">
                {level.icon}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderLevelContent = () => {
    const data = translatedData.length > 0 ? translatedData : getLevelData(currentLevel!);
    return (
      <div className="w-full max-w-6xl px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4">
            <button 
              onClick={() => setCurrentLevel(null)}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md text-indigo-600 font-bold hover:bg-indigo-50 transition-colors"
            >
              <Home className="w-5 h-5" />
              {uiStrings.mainMenu}
            </button>
            <button 
              onClick={() => setShowQuiz(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-full shadow-md text-white font-bold hover:bg-indigo-700 transition-colors"
            >
              <Gamepad2 className="w-5 h-5" />
              {uiStrings.takeQuiz}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-slate-600">{totalStars}</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-slate-600">
                {data.filter(item => completedItems.includes(getItemKey(item))).length} / {data.length}
              </span>
            </div>
          </div>
        </div>

        {isTranslating ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-8 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-2xl font-display text-indigo-600 animate-pulse">Translating level...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {data.map((item, index) => {
              const isCompleted = completedItems.includes(getItemKey(item));
              return (
                <motion.div
                  key={getItemKey(item)}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1 + (0.05 * animationIntensity) }}
                  whileTap={{ scale: 1 - (0.05 * animationIntensity) }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleItemClick(item)}
                  className={`alphabet-card ${item.color || 'bg-white'} aspect-square flex flex-col items-center justify-center text-white group relative`}
                  style={item.hex ? { backgroundColor: item.hex } : {}}
                >
                  <span className="text-5xl md:text-6xl font-display group-hover:scale-110 transition-transform">
                    {item.letter || item.value || item.icon}
                  </span>
                  <span className="text-sm font-bold mt-2">{item.word || item.name}</span>
                  {isCompleted && (
                    <div className="absolute top-2 right-2">
                      <CheckCircleIcon className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderSettingsModal = () => (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden relative border-8 border-white p-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-100 rounded-2xl">
                <Settings className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-4xl font-display text-slate-800">{uiStrings.settings}</h2>
            </div>

            <div className="space-y-8">
              {/* Volume */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xl font-bold text-slate-600">
                    <Volume2 className="w-6 h-6" />
                    {uiStrings.volume}
                  </label>
                  <span className="text-indigo-600 font-bold">{Math.round(volume * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    soundService.setVolume(val);
                    soundService.play('tap');
                  }}
                  className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Animation Intensity */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xl font-bold text-slate-600">
                    <Sparkles className="w-6 h-6" />
                    {uiStrings.animations}
                  </label>
                  <span className="text-indigo-600 font-bold">{Math.round(animationIntensity * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1.5" 
                  step="0.1" 
                  value={animationIntensity}
                  onChange={(e) => {
                    setAnimationIntensity(parseFloat(e.target.value));
                    soundService.play('tap');
                  }}
                  className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xl font-bold text-slate-600">
                  <Gamepad2 className="w-6 h-6" />
                  {uiStrings.difficulty}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => {
                        setQuizDifficulty(diff);
                        soundService.play('tap');
                      }}
                      className={`py-3 rounded-2xl font-bold transition-all border-2 
                        ${quizDifficulty === diff 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' 
                          : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'}`}
                    >
                      {uiStrings[diff]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundService.play('tap');
                setShowSettings(false);
              }}
              className="w-full mt-10 py-4 bg-indigo-600 text-white rounded-full font-bold text-xl shadow-xl hover:scale-105 transition-transform"
            >
              {uiStrings.save}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-amber-50 via-white to-sky-50">
      {/* Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div className="flex-1 hidden md:block" />
        
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 bg-white rounded-3xl shadow-xl"
        >
          <h1 className="font-display text-5xl md:text-7xl text-indigo-600 drop-shadow-sm">
            {uiStrings.title}
          </h1>
        </motion.div>

        <div className="flex-1 flex justify-center md:justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              soundService.play('tap');
              setShowSettings(true);
            }}
            className="p-4 bg-white rounded-2xl shadow-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Settings className="w-6 h-6" />
          </motion.button>
          <div className="p-4 bg-white rounded-2xl shadow-lg flex items-center gap-2 text-yellow-500 font-bold">
            <Star className="w-6 h-6 fill-yellow-500" />
            <span className="text-xl">{totalStars}</span>
          </div>
        </div>
      </header>

      {!currentLevel && (
        <p className="text-slate-500 font-bold text-xl mb-8">{uiStrings.subtitle}</p>
      )}

      {currentLevel ? renderLevelContent() : renderMainMenu()}

      {renderSettingsModal()}

      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuiz && currentLevel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full overflow-hidden relative border-8 border-white p-12"
            >
              <button 
                onClick={() => setShowQuiz(false)}
                className="absolute top-6 right-6 p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-20 shadow-md"
              >
                <X className="w-8 h-8 text-slate-500" />
              </button>

              <Quiz 
                level={currentLevel} 
                language={language}
                difficulty={quizDifficulty}
                onClose={() => setShowQuiz(false)}
                onComplete={(stars) => {
                  setTotalStars(prev => prev + stars);
                  setShowQuiz(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full overflow-hidden relative border-8 border-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-20 shadow-md"
              >
                <X className="w-8 h-8 text-slate-500" />
              </button>

              <div className="flex flex-col md:flex-row h-full min-h-[500px]">
                {/* Left Side: Info */}
                <div className={`w-full md:w-1/2 ${selectedItem.color || 'bg-indigo-500'} p-12 flex flex-col items-center justify-center text-white text-center relative`}
                  style={selectedItem.hex ? { backgroundColor: selectedItem.hex } : {}}
                >
                  <AnimatePresence mode="wait">
                    {!showTracing ? (
                      <motion.div
                        key="info"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col items-center"
                      >
                        <span className="text-[10rem] md:text-[15rem] font-display leading-none mb-4 drop-shadow-2xl">
                          {selectedItem.letter || selectedItem.value || selectedItem.icon}
                        </span>
                        <div className="flex items-center gap-4">
                          <h2 className="text-5xl md:text-7xl font-display drop-shadow-lg">
                            {selectedItem.word || selectedItem.name}
                          </h2>
                          <button 
                            onClick={() => speakText(selectedItem.word || selectedItem.name, language.name)}
                            className="p-4 bg-white/20 rounded-full hover:bg-white/30 transition-colors shadow-lg"
                          >
                            <Volume2 className="w-8 h-8" />
                          </button>
                        </div>
                        
                        {(selectedItem.letter || selectedItem.value) && (
                          <button 
                            onClick={() => setShowTracing(true)}
                            className="mt-8 flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-full font-bold shadow-xl hover:scale-105 transition-transform"
                          >
                            <PenTool className="w-6 h-6" />
                            {uiStrings.practiceWriting}
                          </button>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="tracing"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-3xl font-display">{uiStrings.traceTitle} {selectedItem.letter || selectedItem.value}</h3>
                          <button 
                            onClick={() => setShowTracing(false)}
                            className="p-2 bg-white/20 rounded-full"
                          >
                            <BookOpen className="w-6 h-6" />
                          </button>
                        </div>
                        <TracingCanvas 
                          letter={selectedItem.letter || selectedItem.value.toString()} 
                          progressLabel={uiStrings.tracingProgress}
                          animationIntensity={animationIntensity}
                          onComplete={() => {
                            markCompleted(getItemKey(selectedItem));
                            speakText(uiStrings.excellentWriting, language.name);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right Side: Image */}
                <div className="w-full md:w-1/2 bg-slate-50 p-12 flex items-center justify-center relative">
                  {isLoadingImage ? (
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-16 h-16 border-8 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-400 font-bold text-xl animate-pulse">{uiStrings.magicDrawing}</p>
                    </div>
                  ) : itemImage ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      className="relative p-4 bg-white rounded-[2rem] shadow-2xl"
                    >
                      <img 
                        src={itemImage} 
                        alt={selectedItem.word || selectedItem.name}
                        className="max-w-full max-h-[400px] rounded-xl object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute -top-4 -right-4 bg-yellow-400 p-3 rounded-full shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-[12rem] drop-shadow-2xl">{selectedItem.icon}</div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-auto py-8 text-slate-400 font-bold">
        Made with ❤️ for little explorers
      </footer>
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );
}
