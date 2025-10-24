import type { Blob } from "@google/genai";

export type AppMode = 'capture-photo' | 'capture-video' | 'user-chat' | 'profile' | 'ask-ai' | 'video-call';
export type MediaType = 'image' | 'video';

export interface Media {
  url: string;
  type: MediaType;
}

export interface User {
  id: string;
  username: string;
  profilePicture?: string;
}

export const MEZMA_ASSISTANT_USER: User = {
  id: 'user-mezma-ai-assistant',
  username: 'Mezma AI Assistant',
  profilePicture: 'https://storage.googleapis.com/test-assets-1337/mezma-icon.png'
};

export interface Draft {
  media: Media; // The original media
  currentMediaUrl: string; // The potentially AI-modified URL
  activeFilter: Filter;
  audioSrc: string | null;
  isAudioLooping: boolean;
}

export type Filter = 
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'invert'
  | 'hue-rotate-90'
  | 'contrast'
  | 'saturate'
  | 'noir'
  | 'vintage'
  | 'dreamy'
  | 'cyberpunk'
  | 'toon'
  | 'bright'
  | 'blurry'
  | 'warm'
  | 'cool'
  | 'charcoal'
  | 'silver'
  | 'old-west'
  | 'seventies'
  | 'faded'
  | 'electric'
  | 'hypercolor'
  | 'neon'
  | 'sketch'
  | 'crimson'
  | 'emerald'
  | 'sapphire'
  | 'gold'
  | 'lavender'
  | 'rose-tint'
  | 'melancholy'
  | 'serene'
  | 'energetic'
  | 'romantic'
  | 'eerie'
  | 'sharpen'
  | 'darken'
  | 'oceanic'
  | 'sunset'
  | 'forest'
  | 'winter'
  | 'summer'
  | 'spring'
  | 'autumn'
  | 'x-pro'
  | 'lo-fi'
  | 'nashville'
  | 'inkwell'
  | 'hefe'
  | 'valencia'
  | 'hudson'
  | 'brannan'
  | 'earlybird'
  | 'sierra'
  | 'walden'
  | 'toaster'
  | 'poprocket'
  | 'gotham'
  | 'lomo'
  | 'kelvin'
  | 'maven'
  | 'moon'
  | 'gingham'
  | 'clarendon'
  | 'reyes'
  | 'slumber'
  | 'crema'
  | 'perpetua'
  | 'amaro'
  | 'mayfair'
  | 'rise'
  | 'willow'
  | 'xpro2'
  | 'aden'
  | 'lark'
  | 'juno'
  | 'ludwig'
  | 'inkwell-dark'
  | 'mono-tint'
  | 'arctic'
  | 'desert'
  | 'matrix'
  | 'radioactive'
  | 'fireball'
  | 'ice-cold'
  | 'deep-purple'
  | 'aqua'
  | 'sun-kissed'
  | 'golden-hour'
  | 'blue-lagoon'
  | 'mystic'
  | 'retro-future'
  | 'dream-pop'
  | 'noir-comic'
  | 'acid-wash'
  | 'polaroid'
  | 'daguerreotype'
  | 'technicolor-dream'
  | 'cotton-candy'
  | 'midnight'
  | 'aurora'
  | 'candy-apple'
  | 'faded-glory'
  | 'cinematic-teal'
  | 'moody-film'
  | 'soft-glow'
  | 'vintage-fade'
  | 'emerald-tint'
  | 'glitch'
  | 'scanlines';

export const filters: { name: string; value: Filter }[] = [
    { name: 'Normal', value: 'none' },
    { name: 'Cinematic Teal', value: 'cinematic-teal' },
    { name: 'Moody Film', value: 'moody-film' },
    { name: 'Soft Glow', value: 'soft-glow' },
    { name: 'Vintage Fade', value: 'vintage-fade' },
    { name: 'Emerald Tint', value: 'emerald-tint' },
    { name: 'Toon', value: 'toon' },
    { name: 'Noir Comic', value: 'noir-comic' },
    { name: 'Cyberpunk', value: 'cyberpunk' },
    { name: 'Neon', value: 'neon' },
    { name: 'Retro Future', value: 'retro-future' },
    { name: 'Radioactive', value: 'radioactive' },
    { name: 'Matrix', value: 'matrix' },
    { name: 'Noir', value: 'noir' },
    { name: 'Charcoal', value: 'charcoal' },
    { name: 'Inkwell', value: 'inkwell' },
    { name: 'Silver', value: 'silver' },
    { name: 'Mono Tint', value: 'mono-tint' },
    { name: 'Vintage', value: 'vintage' },
    { name: '70s Vibe', value: 'seventies' },
    { name: 'Old West', value: 'old-west' },
    { name: 'Polaroid', value: 'polaroid' },
    { name: 'Faded Photo', value: 'faded' },
    { name: 'Daguerreotype', value: 'daguerreotype' },
    { name: 'Dreamy', value: 'dreamy' },
    { name: 'Dream Pop', value: 'dream-pop' },
    { name: 'Mystic', value: 'mystic' },
    { name: 'Eerie', value: 'eerie' },
    { name: 'Midnight', value: 'midnight' },
    { name: 'Aurora', value: 'aurora' },
    { name: 'Vibrant', value: 'saturate' },
    { name: 'Electric', value: 'electric' },
    { name: 'Hypercolor', value: 'hypercolor' },
    { name: 'Poprocket', value: 'poprocket' },
    { name: 'Technicolor', value: 'technicolor-dream' },
    { name: 'Cotton Candy', value: 'cotton-candy' },
    { name: 'Crimson', value: 'crimson' },
    { name: 'Emerald', value: 'emerald' },
    { name: 'Sapphire', value: 'sapphire' },
    { name: 'Gold', value: 'gold' },
    { name: 'Lavender', value: 'lavender' },
    { name: 'Rose Tint', value: 'rose-tint' },
    { name: 'Fireball', value: 'fireball' },
    { name: 'Candy Apple', value: 'candy-apple' },
    { name: 'Sunset', value: 'sunset' },
    { name: 'Golden Hour', value: 'golden-hour' },
    { name: 'Sun Kissed', value: 'sun-kissed' },
    { name: 'Summer', value: 'summer' },
    { name: 'Autumn', value: 'autumn' },
    { name: 'Oceanic', value: 'oceanic' },
    { name: 'Blue Lagoon', value: 'blue-lagoon' },
    { name: 'Forest', value: 'forest' },
    { name: 'Desert', value: 'desert' },
    { name: 'Winter', value: 'winter' },
    { name: 'Arctic', value: 'arctic' },
    { name: 'Ice Cold', value: 'ice-cold' },
    { name: 'Cool', value: 'cool' },
    { name: 'Warm', value: 'warm' },
    { name: 'Melancholy', value: 'melancholy' },
    { name: 'Serene', value: 'serene' },
    { name: 'Energetic', value: 'energetic' },
    { name: 'Romantic', value: 'romantic' },
    { name: 'Acid Wash', value: 'acid-wash' },
    { name: 'Sketch', value: 'sketch' },
    { name: 'Deep Purple', value: 'deep-purple' },
    { name: 'Aqua', value: 'aqua' },
    { name: 'Faded Glory', value: 'faded-glory' },
    { name: 'High Contrast', value: 'contrast' },
    { name: 'Bright', value: 'bright' },
    { name: 'Darken', value: 'darken' },
    { name: 'Sharpen', value: 'sharpen' },
    { name: 'Blurry', value: 'blurry' },
    { name: 'Invert', value: 'invert' },
    { name: 'X-Pro II', value: 'xpro2' },
    { name: 'Lo-Fi', value: 'lo-fi' },
    { name: 'Hefe', value: 'hefe' },
    { name: 'Nashville', value: 'nashville' },
    { name: 'Brannan', value: 'brannan' },
    { name: 'Earlybird', value: 'earlybird' },
    { name: 'Toaster', value: 'toaster' },
    { name: 'Walden', value: 'walden' },
    { name: 'Hudson', value: 'hudson' },
    { name: 'Valencia', value: 'valencia' },
    { name: 'Sierra', value: 'sierra' },
    { name: 'Willow', value: 'willow' },
    { name: 'Lark', value: 'lark' },
    { name: 'Juno', value: 'juno' },
    { name: 'Ludwig', value: 'ludwig' },
    { name: 'Perpetua', value: 'perpetua' },
    { name: 'Amaro', value: 'amaro' },
    { name: 'Mayfair', value: 'mayfair' },
    { name: 'Rise', value: 'rise' },
    { name: 'Gingham', value: 'gingham' },
    { name: 'Clarendon', value: 'clarendon' },
    { name: 'Reyes', value: 'reyes' },
    { name: 'Slumber', value: 'slumber' },
    { name: 'Crema', value: 'crema' },
    { name: 'Aden', value: 'aden' },
    { name: 'Glitch', value: 'glitch' },
    { name: 'Scanlines', value: 'scanlines' },
];

export const aiFilters: { name: string; value: Filter }[] = [
    { name: 'Toon', value: 'toon' },
    { name: 'Cyberpunk', value: 'cyberpunk' },
    { name: 'Noir Comic', value: 'noir-comic' },
    { name: 'Dreamy', value: 'dreamy' },
    { name: 'Neon', value: 'neon' },
    { name: 'Sketch', value: 'sketch' },
    { name: 'Matrix', value: 'matrix' },
    { name: 'Radioactive', value: 'radioactive' },
];

export const videoEffects: { name: string; value: Filter }[] = [
    ...aiFilters,
    { name: 'Glitch', value: 'glitch' },
    { name: 'Scanlines', value: 'scanlines' },
];


export interface TranscriptEntry {
  id: number;
  speaker: 'user' | 'model';
  text: string;
}

export interface SampleAudio {
  name: string;
  url: string;
}

export const sampleAudioTracks: SampleAudio[] = [
  { name: 'Forever - Chris Brown', url: 'https://storage.googleapis.com/test-assets-1337/Upbeat-Funk.mp3' },
  { name: 'So Sick - Ne-Yo', url: 'https://storage.googleapis.com/test-assets-1337/Chill-Lofi.mp3' },
  { name: 'No Role Modelz - J. Cole', url: 'https://storage.googleapis.com/test-assets-1337/Acoustic-Folk.mp3' },
  { name: 'Blinding Lights - The Weeknd', url: 'https://storage.googleapis.com/test-assets-1337/8-bit-Adventure.mp3' },
  { name: 'Yeah! - Usher', url: 'https://storage.googleapis.com/test-assets-1337/Upbeat-Funk.mp3' },
  { name: 'Bodak Yellow - Cardi B', url: 'https://storage.googleapis.com/test-assets-1337/Dramatic-Cinematic.mp3' },
  { name: 'Super Bass - Nicki Minaj', url: 'https://storage.googleapis.com/test-assets-1337/8-bit-Adventure.mp3' },
  { name: 'Yope - Diamond Platnumz', url: 'https://storage.googleapis.com/test-assets-1337/Acoustic-Folk.mp3' },
  { name: 'Aje - Alikiba', url: 'https://storage.googleapis.com/test-assets-1337/Chill-Lofi.mp3' },
  { name: 'Wiggle - Jason Derulo', url: 'https://storage.googleapis.com/test-assets-1337/Upbeat-Funk.mp3' },
  { name: 'Upbeat Funk', url: 'https://storage.googleapis.com/test-assets-1337/Upbeat-Funk.mp3' },
  { name: 'Chill Lofi', url: 'https://storage.googleapis.com/test-assets-1337/Chill-Lofi.mp3' },
  { name: 'Dramatic Cinematic', url: 'https://storage.googleapis.com/test-assets-1337/Dramatic-Cinematic.mp3' },
];

// --- User Chat Types ---
export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  messages: ChatMessage[];
}

// --- Ask AI Types ---
export interface AIChatMessage {
    id: number;
    text: string;
    isUser: boolean;
    isLoading?: boolean;
}