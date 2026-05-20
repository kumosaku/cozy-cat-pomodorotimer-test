export const FOCUS_DURATION = 25 * 60;  // seconds
export const BREAK_DURATION = 5 * 60;
export const MAX_POMODOROS = 7;

export const FOCUS_TAP_LINES = [
  'ケータイ見ちゃだめ、僕をみて',
  'もうちょっとだよ、集中して',
  'がんばって！ もう少し！',
  'ねえ、こっち向いて',
];

// pomodoroCount 1〜7 に対応（インデックス 0〜6）
export const BREAK_DATA = [
  { action: 'stretch', text: 'お疲れ〜！よく頑張ったね' },
  { action: 'flat',    text: 'ご飯、食べた？' },
  { action: 'bounce',  text: 'ちゅ〜る、ほしいな…' },
  { action: 'expand',  text: '私のために、稼いで！' },
  { action: 'spin',    text: '疲れた？…僕もちょっと疲れた' },
  { action: 'small',   text: 'もう少しで終わりだよ、えらい！' },
  { action: 'glow',    text: '今日もお疲れ様！最高だよ！' },
];

export const DONE_TEXT = 'やったー！今日も一日お疲れ様！';

export const CAT_CLICK_LINES = [
  'ごろごろごろ…',
  'ぐるぐるにゃん',
  'んにゃ〜',
  'ふにゃ…',
  'にゃーん♪',
  'なでなで、もっと',
];

export const MID_BREAK_LINES = [
  'まだ休んでていいよ〜',
  'のんびりしてね',
  'ちゅ〜るのこと考えてた',
  'のびしよー',
  'あまいのたべる？',
  'トイレ行く？',
  'おちゃのもー',
  'きゅうけいだよー',
  'しんこきゅうーにくきゅうー',
  'おひさまあびたーい',
  'せすじのばそー',
  'おさんぽいこーよ',
  'おなかへってない？',
  '頭つかっちゃだめ',
  'ぼんやりしよー',
];
