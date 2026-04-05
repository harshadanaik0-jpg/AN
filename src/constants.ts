export const SOUND_EFFECTS = {
  tap: 'https://assets.mixkit.co/sfx/preview/mixkit-pop-down-click-1161.mp3',
  success: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-reward-952.mp3',
  error: 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3',
  levelUp: 'https://assets.mixkit.co/sfx/preview/mixkit-level-up-bonus-1440.mp3',
  sparkle: 'https://assets.mixkit.co/sfx/preview/mixkit-magic-sparkle-whoosh-2350.mp3',
};

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export interface AlphabetItem {
  letter: string;
  word: string;
  color: string;
  icon: string;
  imagePrompt: string;
}

export interface NumberItem {
  value: number;
  word: string;
  color: string;
  icon: string;
  imagePrompt: string;
}

export interface ColorItem {
  name: string;
  hex: string;
  example: string;
  imagePrompt: string;
}

export interface GenericItem {
  name: string;
  icon: string;
  imagePrompt: string;
  color: string;
}

export type LevelType = 'alphabets' | 'numbers' | 'colors' | 'animals' | 'places';

export interface Level {
  id: LevelType;
  title: string;
  icon: string;
  color: string;
  description: string;
}

export const LEVELS: Level[] = [
  { id: 'alphabets', title: 'ABC Adventure', icon: '🔤', color: 'bg-rose-400', description: 'Learn your ABCs!' },
  { id: 'numbers', title: 'Number Fun', icon: '🔢', color: 'bg-sky-400', description: 'Count 1 to 10!' },
  { id: 'colors', title: 'Color World', icon: '🎨', color: 'bg-lime-400', description: 'Rainbow of colors!' },
  { id: 'animals', title: 'Animal Safari', icon: '🦁', color: 'bg-orange-400', description: 'Meet furry friends!' },
  { id: 'places', title: 'Cool Places', icon: '🌍', color: 'bg-indigo-400', description: 'Explore the world!' },
];

export const ALPHABET_DATA: AlphabetItem[] = [
  { letter: 'A', word: 'Apple', color: 'bg-red-400', icon: '🍎', imagePrompt: 'A bright red juicy apple on a white background, cartoon style' },
  { letter: 'B', word: 'Ball', color: 'bg-blue-400', icon: '⚽', imagePrompt: 'A colorful soccer ball on green grass, cartoon style' },
  { letter: 'C', word: 'Cat', color: 'bg-orange-400', icon: '🐱', imagePrompt: 'A cute fluffy orange kitten sitting, cartoon style' },
  { letter: 'D', word: 'Dog', color: 'bg-yellow-600', icon: '🐶', imagePrompt: 'A happy golden retriever puppy wagging its tail, cartoon style' },
  { letter: 'E', word: 'Elephant', color: 'bg-gray-400', icon: '🐘', imagePrompt: 'A friendly blue-grey elephant with big ears, cartoon style' },
  { letter: 'F', word: 'Fish', color: 'bg-cyan-400', icon: '🐟', imagePrompt: 'A bright orange goldfish swimming, cartoon style' },
  { letter: 'G', word: 'Giraffe', color: 'bg-yellow-400', icon: '🦒', imagePrompt: 'A tall giraffe with brown spots, cartoon style' },
  { letter: 'H', word: 'Horse', color: 'bg-amber-600', icon: '🐴', imagePrompt: 'A brown horse running in a field, cartoon style' },
  { letter: 'I', word: 'Ice Cream', color: 'bg-pink-300', icon: '🍦', imagePrompt: 'A delicious strawberry ice cream cone, cartoon style' },
  { letter: 'J', word: 'Jellyfish', color: 'bg-purple-400', icon: '🪼', imagePrompt: 'A glowing purple jellyfish in the ocean, cartoon style' },
  { letter: 'K', word: 'Kangaroo', color: 'bg-orange-500', icon: '🦘', imagePrompt: 'A kangaroo with a joey in its pouch, cartoon style' },
  { letter: 'L', word: 'Lion', color: 'bg-yellow-500', icon: '🦁', imagePrompt: 'A brave lion with a big mane, cartoon style' },
  { letter: 'M', word: 'Monkey', color: 'bg-amber-700', icon: '🐒', imagePrompt: 'A cheeky monkey hanging from a branch, cartoon style' },
  { letter: 'N', word: 'Nest', color: 'bg-stone-400', icon: '🪺', imagePrompt: 'A bird nest with three blue eggs, cartoon style' },
  { letter: 'O', word: 'Orange', color: 'bg-orange-600', icon: '🍊', imagePrompt: 'A fresh orange fruit with a green leaf, cartoon style' },
  { letter: 'P', word: 'Penguin', color: 'bg-slate-500', icon: '🐧', imagePrompt: 'A cute penguin standing on ice, cartoon style' },
  { letter: 'Q', word: 'Queen', color: 'bg-purple-600', icon: '👑', imagePrompt: 'A royal queen with a golden crown, cartoon style' },
  { letter: 'R', word: 'Rabbit', color: 'bg-zinc-300', icon: '🐰', imagePrompt: 'A white fluffy rabbit eating a carrot, cartoon style' },
  { letter: 'S', word: 'Sun', color: 'bg-yellow-300', icon: '☀️', imagePrompt: 'A happy smiling yellow sun, cartoon style' },
  { letter: 'T', word: 'Tiger', color: 'bg-orange-400', icon: '🐯', imagePrompt: 'A powerful tiger with black stripes, cartoon style' },
  { letter: 'U', word: 'Umbrella', color: 'bg-indigo-400', icon: '☂️', imagePrompt: 'A colorful rainbow umbrella, cartoon style' },
  { letter: 'V', word: 'Van', color: 'bg-blue-500', icon: '🚐', imagePrompt: 'A bright blue family van, cartoon style' },
  { letter: 'W', word: 'Whale', color: 'bg-blue-600', icon: '🐳', imagePrompt: 'A big blue whale spouting water, cartoon style' },
  { letter: 'X', word: 'Xylophone', color: 'bg-pink-500', icon: '🎹', imagePrompt: 'A colorful musical xylophone, cartoon style' },
  { letter: 'Y', word: 'Yo-yo', color: 'bg-red-500', icon: '🪀', imagePrompt: 'A spinning red yo-yo, cartoon style' },
  { letter: 'Z', word: 'Zebra', color: 'bg-neutral-800', icon: '🦓', imagePrompt: 'A black and white striped zebra, cartoon style' },
];

export const NUMBERS_DATA: NumberItem[] = [
  { value: 1, word: 'One', color: 'bg-red-400', icon: '1️⃣', imagePrompt: 'One big red apple, cartoon style' },
  { value: 2, word: 'Two', color: 'bg-blue-400', icon: '2️⃣', imagePrompt: 'Two blue butterflies flying, cartoon style' },
  { value: 3, word: 'Three', color: 'bg-green-400', icon: '3️⃣', imagePrompt: 'Three green frogs on a lily pad, cartoon style' },
  { value: 4, word: 'Four', color: 'bg-yellow-400', icon: '4️⃣', imagePrompt: 'Four yellow ducks swimming, cartoon style' },
  { value: 5, word: 'Five', color: 'bg-purple-400', icon: '5️⃣', imagePrompt: 'Five purple grapes on a vine, cartoon style' },
  { value: 6, word: 'Six', color: 'bg-orange-400', icon: '6️⃣', imagePrompt: 'Six orange carrots in a row, cartoon style' },
  { value: 7, word: 'Seven', color: 'bg-pink-400', icon: '7️⃣', imagePrompt: 'Seven pink flowers in a garden, cartoon style' },
  { value: 8, word: 'Eight', color: 'bg-indigo-400', icon: '8️⃣', imagePrompt: 'Eight indigo stars in the sky, cartoon style' },
  { value: 9, word: 'Nine', color: 'bg-teal-400', icon: '9️⃣', imagePrompt: 'Nine teal balloons floating, cartoon style' },
  { value: 10, word: 'Ten', color: 'bg-rose-400', icon: '🔟', imagePrompt: 'Ten little fingers waving, cartoon style' },
];

export const COLORS_DATA: ColorItem[] = [
  { name: 'Red', hex: '#ef4444', example: 'Strawberry', imagePrompt: 'A bright red strawberry, cartoon style' },
  { name: 'Blue', hex: '#3b82f6', example: 'Sky', imagePrompt: 'A clear blue sky with white clouds, cartoon style' },
  { name: 'Green', hex: '#22c55e', example: 'Leaf', imagePrompt: 'A fresh green leaf, cartoon style' },
  { name: 'Yellow', hex: '#eab308', example: 'Banana', imagePrompt: 'A ripe yellow banana, cartoon style' },
  { name: 'Purple', hex: '#a855f7', example: 'Eggplant', imagePrompt: 'A shiny purple eggplant, cartoon style' },
  { name: 'Orange', hex: '#f97316', example: 'Orange', imagePrompt: 'A fresh orange fruit, cartoon style' },
  { name: 'Pink', hex: '#ec4899', example: 'Flamingo', imagePrompt: 'A pink flamingo standing on one leg, cartoon style' },
];

export const ANIMALS_DATA: GenericItem[] = [
  { name: 'Lion', icon: '🦁', color: 'bg-yellow-500', imagePrompt: 'A brave lion with a big mane, cartoon style' },
  { name: 'Elephant', icon: '🐘', color: 'bg-gray-400', imagePrompt: 'A friendly grey elephant, cartoon style' },
  { name: 'Monkey', icon: '🐒', color: 'bg-amber-700', imagePrompt: 'A cheeky monkey, cartoon style' },
  { name: 'Giraffe', icon: '🦒', color: 'bg-yellow-400', imagePrompt: 'A tall giraffe, cartoon style' },
  { name: 'Tiger', icon: '🐯', color: 'bg-orange-500', imagePrompt: 'A powerful tiger, cartoon style' },
  { name: 'Panda', icon: '🐼', color: 'bg-slate-200', imagePrompt: 'A cute panda eating bamboo, cartoon style' },
];

export const PLACES_DATA: GenericItem[] = [
  { name: 'Beach', icon: '🏖️', color: 'bg-sky-300', imagePrompt: 'A sunny beach with blue water and sand, cartoon style' },
  { name: 'Park', icon: '🌳', color: 'bg-green-400', imagePrompt: 'A green park with trees and a bench, cartoon style' },
  { name: 'School', icon: '🏫', color: 'bg-red-400', imagePrompt: 'A friendly red school building, cartoon style' },
  { name: 'Farm', icon: '🚜', color: 'bg-amber-500', imagePrompt: 'A farm with a red barn and a tractor, cartoon style' },
  { name: 'Space', icon: '🚀', color: 'bg-indigo-900', imagePrompt: 'Outer space with stars and a rocket, cartoon style' },
];
