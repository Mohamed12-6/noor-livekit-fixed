export type LocalizedText = { en: string; ar: string };

export const lessons = [
  { id: 'makharij', category: 'tajweed', en: 'The sounds of the Qur’an', ar: 'مخارج الحروف', description: 'Learn where each letter begins, with a patient listening practice.', duration: '12 min' },
  { id: 'salah', category: 'foundations', en: 'My first prayer', ar: 'صلاتي الأولى', description: 'A gentle walk through wudu, standing, bowing, and gratitude.', duration: '18 min' },
  { id: 'arabic', category: 'primary', en: 'Arabic for young readers', ar: 'العربية للناشئين', description: 'Build a bright foundation in letters, words, and short sentences.', duration: '15 min' },
  { id: 'manners', category: 'foundations', en: 'Beautiful manners', ar: 'آداب المسلم', description: 'Small daily sunnahs that make home and school feel kinder.', duration: '9 min' },
  { id: 'stories', category: 'primary', en: 'Stories of the Prophets', ar: 'قصص الأنبياء', description: 'Meet the Prophets through memorable moments and meaningful choices.', duration: '21 min' },
  { id: 'fractions', category: 'primary', en: 'Fractions made clear', ar: 'الكسور ببساطة', description: 'A calm, visual lesson for building confidence with fractions.', duration: '16 min' },
];

export type Surah = { id: string; number: string; en: string; ar: string; verses: number };

export const surahs: Surah[] = [
  { id: 'surah-1', number: '01', en: 'Al-Faatiha', ar: 'سُورَةُ ٱلْفَاتِحَةِ', verses: 7 },
  { id: 'surah-2', number: '02', en: 'Al-Baqara', ar: 'سُورَةُ البَقَرَةِ', verses: 286 },
  { id: 'surah-3', number: '03', en: 'Aal-i-Imraan', ar: 'سُورَةُ آلِ عِمۡرَانَ', verses: 200 },
  { id: 'surah-4', number: '04', en: 'An-Nisaa', ar: 'سُورَةُ النِّسَاءِ', verses: 176 },
  { id: 'surah-5', number: '05', en: 'Al-Maaida', ar: 'سُورَةُ المَائـِدَةِ', verses: 120 },
  { id: 'surah-6', number: '06', en: 'Al-An\'aam', ar: 'سُورَةُ الأَنۡعَامِ', verses: 165 },
  { id: 'surah-7', number: '07', en: 'Al-A\'raaf', ar: 'سُورَةُ الأَعۡرَافِ', verses: 206 },
  { id: 'surah-8', number: '08', en: 'Al-Anfaal', ar: 'سُورَةُ الأَنفَالِ', verses: 75 },
  { id: 'surah-9', number: '09', en: 'At-Tawba', ar: 'سُورَةُ التَّوۡبَةِ', verses: 129 },
  { id: 'surah-10', number: '10', en: 'Yunus', ar: 'سُورَةُ يُونُسَ', verses: 109 },
  { id: 'surah-11', number: '11', en: 'Hud', ar: 'سُورَةُ هُودٍ', verses: 123 },
  { id: 'surah-12', number: '12', en: 'Yusuf', ar: 'سُورَةُ يُوسُفَ', verses: 111 },
  { id: 'surah-13', number: '13', en: 'Ar-Ra\'d', ar: 'سُورَةُ الرَّعۡدِ', verses: 43 },
  { id: 'surah-14', number: '14', en: 'Ibrahim', ar: 'سُورَةُ إِبۡرَاهِيمَ', verses: 52 },
  { id: 'surah-15', number: '15', en: 'Al-Hijr', ar: 'سُورَةُ الحِجۡرِ', verses: 99 },
  { id: 'surah-16', number: '16', en: 'An-Nahl', ar: 'سُورَةُ النَّحۡلِ', verses: 128 },
  { id: 'surah-17', number: '17', en: 'Al-Israa', ar: 'سُورَةُ الإِسۡرَاءِ', verses: 111 },
  { id: 'surah-18', number: '18', en: 'Al-Kahf', ar: 'سُورَةُ الكَهۡفِ', verses: 110 },
  { id: 'surah-19', number: '19', en: 'Maryam', ar: 'سُورَةُ مَرۡيَمَ', verses: 98 },
  { id: 'surah-20', number: '20', en: 'Taa-Haa', ar: 'سُورَةُ طه', verses: 135 },
  { id: 'surah-21', number: '21', en: 'Al-Anbiyaa', ar: 'سُورَةُ الأَنبِيَاءِ', verses: 112 },
  { id: 'surah-22', number: '22', en: 'Al-Hajj', ar: 'سُورَةُ الحَجِّ', verses: 78 },
  { id: 'surah-23', number: '23', en: 'Al-Muminoon', ar: 'سُورَةُ المُؤۡمِنُونَ', verses: 118 },
  { id: 'surah-24', number: '24', en: 'An-Noor', ar: 'سُورَةُ النُّورِ', verses: 64 },
  { id: 'surah-25', number: '25', en: 'Al-Furqaan', ar: 'سُورَةُ الفُرۡقَانِ', verses: 77 },
  { id: 'surah-26', number: '26', en: 'Ash-Shu\'araa', ar: 'سُورَةُ الشُّعَرَاءِ', verses: 227 },
  { id: 'surah-27', number: '27', en: 'An-Naml', ar: 'سُورَةُ النَّمۡلِ', verses: 93 },
  { id: 'surah-28', number: '28', en: 'Al-Qasas', ar: 'سُورَةُ القَصَصِ', verses: 88 },
  { id: 'surah-29', number: '29', en: 'Al-Ankaboot', ar: 'سُورَةُ العَنكَبُوتِ', verses: 69 },
  { id: 'surah-30', number: '30', en: 'Ar-Room', ar: 'سُورَةُ الرُّومِ', verses: 60 },
  { id: 'surah-31', number: '31', en: 'Luqman', ar: 'سُورَةُ لُقۡمَانَ', verses: 34 },
  { id: 'surah-32', number: '32', en: 'As-Sajda', ar: 'سُورَةُ السَّجۡدَةِ', verses: 30 },
  { id: 'surah-33', number: '33', en: 'Al-Ahzaab', ar: 'سُورَةُ الأَحۡزَابِ', verses: 73 },
  { id: 'surah-34', number: '34', en: 'Saba', ar: 'سُورَةُ سَبَإٍ', verses: 54 },
  { id: 'surah-35', number: '35', en: 'Faatir', ar: 'سُورَةُ فَاطِرٍ', verses: 45 },
  { id: 'surah-36', number: '36', en: 'Yaseen', ar: 'سُورَةُ يسٓ', verses: 83 },
  { id: 'surah-37', number: '37', en: 'As-Saaffaat', ar: 'سُورَةُ الصَّافَّاتِ', verses: 182 },
  { id: 'surah-38', number: '38', en: 'Saad', ar: 'سُورَةُ صٓ', verses: 88 },
  { id: 'surah-39', number: '39', en: 'Az-Zumar', ar: 'سُورَةُ الزُّمَرِ', verses: 75 },
  { id: 'surah-40', number: '40', en: 'Ghafir', ar: 'سُورَةُ غَافِرٍ', verses: 85 },
  { id: 'surah-41', number: '41', en: 'Fussilat', ar: 'سُورَةُ فُصِّلَتۡ', verses: 54 },
  { id: 'surah-42', number: '42', en: 'Ash-Shura', ar: 'سُورَةُ الشُّورَىٰ', verses: 53 },
  { id: 'surah-43', number: '43', en: 'Az-Zukhruf', ar: 'سُورَةُ الزُّخۡرُفِ', verses: 89 },
  { id: 'surah-44', number: '44', en: 'Ad-Dukhaan', ar: 'سُورَةُ الدُّخَانِ', verses: 59 },
  { id: 'surah-45', number: '45', en: 'Al-Jaathiya', ar: 'سُورَةُ الجَاثِيَةِ', verses: 37 },
  { id: 'surah-46', number: '46', en: 'Al-Ahqaf', ar: 'سُورَةُ الأَحۡقَافِ', verses: 35 },
  { id: 'surah-47', number: '47', en: 'Muhammad', ar: 'سُورَةُ مُحَمَّدٍ', verses: 38 },
  { id: 'surah-48', number: '48', en: 'Al-Fath', ar: 'سُورَةُ الفَتۡحِ', verses: 29 },
  { id: 'surah-49', number: '49', en: 'Al-Hujuraat', ar: 'سُورَةُ الحُجُرَاتِ', verses: 18 },
  { id: 'surah-50', number: '50', en: 'Qaaf', ar: 'سُورَةُ قٓ', verses: 45 },
  { id: 'surah-51', number: '51', en: 'Adh-Dhaariyat', ar: 'سُورَةُ الذَّارِيَاتِ', verses: 60 },
  { id: 'surah-52', number: '52', en: 'At-Tur', ar: 'سُورَةُ الطُّورِ', verses: 49 },
  { id: 'surah-53', number: '53', en: 'An-Najm', ar: 'سُورَةُ النَّجۡمِ', verses: 62 },
  { id: 'surah-54', number: '54', en: 'Al-Qamar', ar: 'سُورَةُ القَمَرِ', verses: 55 },
  { id: 'surah-55', number: '55', en: 'Ar-Rahmaan', ar: 'سُورَةُ الرَّحۡمَٰن', verses: 78 },
  { id: 'surah-56', number: '56', en: 'Al-Waaqia', ar: 'سُورَةُ الوَاقِعَةِ', verses: 96 },
  { id: 'surah-57', number: '57', en: 'Al-Hadid', ar: 'سُورَةُ الحَدِيدِ', verses: 29 },
  { id: 'surah-58', number: '58', en: 'Al-Mujaadila', ar: 'سُورَةُ المُجَادلَةِ', verses: 22 },
  { id: 'surah-59', number: '59', en: 'Al-Hashr', ar: 'سُورَةُ الحَشۡرِ', verses: 24 },
  { id: 'surah-60', number: '60', en: 'Al-Mumtahana', ar: 'سُورَةُ المُمۡتَحنَةِ', verses: 13 },
  { id: 'surah-61', number: '61', en: 'As-Saff', ar: 'سُورَةُ الصَّفِّ', verses: 14 },
  { id: 'surah-62', number: '62', en: 'Al-Jumu\'a', ar: 'سُورَةُ الجُمُعَةِ', verses: 11 },
  { id: 'surah-63', number: '63', en: 'Al-Munaafiqoon', ar: 'سُورَةُ المُنَافِقُونَ', verses: 11 },
  { id: 'surah-64', number: '64', en: 'At-Taghaabun', ar: 'سُورَةُ التَّغَابُنِ', verses: 18 },
  { id: 'surah-65', number: '65', en: 'At-Talaaq', ar: 'سُورَةُ الطَّلَاقِ', verses: 12 },
  { id: 'surah-66', number: '66', en: 'At-Tahrim', ar: 'سُورَةُ التَّحۡرِيمِ', verses: 12 },
  { id: 'surah-67', number: '67', en: 'Al-Mulk', ar: 'سُورَةُ المُلۡكِ', verses: 30 },
  { id: 'surah-68', number: '68', en: 'Al-Qalam', ar: 'سُورَةُ القَلَمِ', verses: 52 },
  { id: 'surah-69', number: '69', en: 'Al-Haaqqa', ar: 'سُورَةُ الحَاقَّةِ', verses: 52 },
  { id: 'surah-70', number: '70', en: 'Al-Ma\'aarij', ar: 'سُورَةُ المَعَارِجِ', verses: 44 },
  { id: 'surah-71', number: '71', en: 'Nooh', ar: 'سُورَةُ نُوحٍ', verses: 28 },
  { id: 'surah-72', number: '72', en: 'Al-Jinn', ar: 'سُورَةُ الجِنِّ', verses: 28 },
  { id: 'surah-73', number: '73', en: 'Al-Muzzammil', ar: 'سُورَةُ المُزَّمِّلِ', verses: 20 },
  { id: 'surah-74', number: '74', en: 'Al-Muddaththir', ar: 'سُورَةُ المُدَّثِّرِ', verses: 56 },
  { id: 'surah-75', number: '75', en: 'Al-Qiyaama', ar: 'سُورَةُ القِيَامَةِ', verses: 40 },
  { id: 'surah-76', number: '76', en: 'Al-Insaan', ar: 'سُورَةُ الإِنسَانِ', verses: 31 },
  { id: 'surah-77', number: '77', en: 'Al-Mursalaat', ar: 'سُورَةُ المُرۡسَلَاتِ', verses: 50 },
  { id: 'surah-78', number: '78', en: 'An-Naba', ar: 'سُورَةُ النَّبَإِ', verses: 40 },
  { id: 'surah-79', number: '79', en: 'An-Naazi\'aat', ar: 'سُورَةُ النَّازِعَاتِ', verses: 46 },
  { id: 'surah-80', number: '80', en: 'Abasa', ar: 'سُورَةُ عَبَسَ', verses: 42 },
  { id: 'surah-81', number: '81', en: 'At-Takwir', ar: 'سُورَةُ التَّكۡوِيرِ', verses: 29 },
  { id: 'surah-82', number: '82', en: 'Al-Infitaar', ar: 'سُورَةُ الانفِطَارِ', verses: 19 },
  { id: 'surah-83', number: '83', en: 'Al-Mutaffifin', ar: 'سُورَةُ المُطَفِّفِينَ', verses: 36 },
  { id: 'surah-84', number: '84', en: 'Al-Inshiqaaq', ar: 'سُورَةُ الانشِقَاقِ', verses: 25 },
  { id: 'surah-85', number: '85', en: 'Al-Burooj', ar: 'سُورَةُ البُرُوجِ', verses: 22 },
  { id: 'surah-86', number: '86', en: 'At-Taariq', ar: 'سُورَةُ الطَّارِقِ', verses: 17 },
  { id: 'surah-87', number: '87', en: 'Al-A\'laa', ar: 'سُورَةُ الأَعۡلَىٰ', verses: 19 },
  { id: 'surah-88', number: '88', en: 'Al-Ghaashiya', ar: 'سُورَةُ الغَاشِيَةِ', verses: 26 },
  { id: 'surah-89', number: '89', en: 'Al-Fajr', ar: 'سُورَةُ الفَجۡرِ', verses: 30 },
  { id: 'surah-90', number: '90', en: 'Al-Balad', ar: 'سُورَةُ البَلَدِ', verses: 20 },
  { id: 'surah-91', number: '91', en: 'Ash-Shams', ar: 'سُورَةُ الشَّمۡسِ', verses: 15 },
  { id: 'surah-92', number: '92', en: 'Al-Lail', ar: 'سُورَةُ اللَّيۡلِ', verses: 21 },
  { id: 'surah-93', number: '93', en: 'Ad-Dhuhaa', ar: 'سُورَةُ الضُّحَىٰ', verses: 11 },
  { id: 'surah-94', number: '94', en: 'Ash-Sharh', ar: 'سُورَةُ الشَّرۡحِ', verses: 8 },
  { id: 'surah-95', number: '95', en: 'At-Tin', ar: 'سُورَةُ التِّينِ', verses: 8 },
  { id: 'surah-96', number: '96', en: 'Al-Alaq', ar: 'سُورَةُ العَلَقِ', verses: 19 },
  { id: 'surah-97', number: '97', en: 'Al-Qadr', ar: 'سُورَةُ القَدۡرِ', verses: 5 },
  { id: 'surah-98', number: '98', en: 'Al-Bayyina', ar: 'سُورَةُ البَيِّنَةِ', verses: 8 },
  { id: 'surah-99', number: '99', en: 'Az-Zalzala', ar: 'سُورَةُ الزَّلۡزَلَةِ', verses: 8 },
  { id: 'surah-100', number: '100', en: 'Al-Aadiyaat', ar: 'سُورَةُ العَادِيَاتِ', verses: 11 },
  { id: 'surah-101', number: '101', en: 'Al-Qaari\'a', ar: 'سُورَةُ القَارِعَةِ', verses: 11 },
  { id: 'surah-102', number: '102', en: 'At-Takaathur', ar: 'سُورَةُ التَّكَاثُرِ', verses: 8 },
  { id: 'surah-103', number: '103', en: 'Al-Asr', ar: 'سُورَةُ العَصۡرِ', verses: 3 },
  { id: 'surah-104', number: '104', en: 'Al-Humaza', ar: 'سُورَةُ الهُمَزَةِ', verses: 9 },
  { id: 'surah-105', number: '105', en: 'Al-Fil', ar: 'سُورَةُ الفِيلِ', verses: 5 },
  { id: 'surah-106', number: '106', en: 'Quraish', ar: 'سُورَةُ قُرَيۡشٍ', verses: 4 },
  { id: 'surah-107', number: '107', en: 'Al-Maa\'un', ar: 'سُورَةُ المَاعُونِ', verses: 7 },
  { id: 'surah-108', number: '108', en: 'Al-Kawthar', ar: 'سُورَةُ الكَوۡثَرِ', verses: 3 },
  { id: 'surah-109', number: '109', en: 'Al-Kaafiroon', ar: 'سُورَةُ الكَافِرُونَ', verses: 6 },
  { id: 'surah-110', number: '110', en: 'An-Nasr', ar: 'سُورَةُ النَّصۡرِ', verses: 3 },
  { id: 'surah-111', number: '111', en: 'Al-Masad', ar: 'سُورَةُ المَسَدِ', verses: 5 },
  { id: 'surah-112', number: '112', en: 'Al-Ikhlaas', ar: 'سُورَةُ الإِخۡلَاصِ', verses: 4 },
  { id: 'surah-113', number: '113', en: 'Al-Falaq', ar: 'سُورَةُ الفَلَقِ', verses: 5 },
  { id: 'surah-114', number: '114', en: 'An-Naas', ar: 'سُورَةُ النَّاسِ', verses: 6 },
];

export type Reciter = { id: string; name: LocalizedText; edition: string; bitrate: number };

// Reciters available via the Islamic Network Quran CDN (cdn.islamic.network).
// To add another sheikh, append an entry here — the audio URL is built automatically.
export const reciters: Reciter[] = [
  { id: 'alafasy', name: { en: 'Mishary Rashid Alafasy', ar: 'مشاري راشد العفاسي' }, edition: 'ar.alafasy', bitrate: 128 },
  { id: 'basfar', name: { en: 'Abdullah Basfar', ar: 'عبد الله بصفر' }, edition: 'ar.abdullahbasfar', bitrate: 128 },
];

export type QuranRecitation = {
  id: string;
  surahId: string;
  surahName: LocalizedText;
  passage: LocalizedText;
  reciter: LocalizedText;
  audioUrl: string;
  provider: string;
};

const CDN = 'https://cdn.islamic.network/quran/audio-surah';

export function buildAudioUrl(number: number, edition: string, bitrate = 128) {
  return `${CDN}/${bitrate}/${edition}/${number}.mp3`;
}

export function getReciter(reciterId: string): Reciter {
  return reciters.find((r) => r.id === reciterId) ?? reciters[0];
}

export function getQuranRecitation(surahId: string, reciterId = 'alafasy'): QuranRecitation | undefined {
  const surah = surahs.find((s) => s.id === surahId);
  if (!surah) return undefined;
  const reciter = getReciter(reciterId);
  return {
    id: `${surah.id}-${reciter.id}`,
    surahId: surah.id,
    surahName: { en: surah.en, ar: surah.ar },
    passage: { en: `Full surah \u00b7 ${surah.verses} verses`, ar: `السورة كاملة · ${surah.verses} آيات` },
    reciter: reciter.name,
    audioUrl: buildAudioUrl(Number(surah.number), reciter.edition, reciter.bitrate),
    provider: 'Islamic Network Quran CDN',
  };
}
