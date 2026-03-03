// src/i18n.js — Runtime language switching

import { CARDS, CARD_UPGRADES } from './data.js';

const CARD_KO = {
  bash: { name: '배시', description: '8 피해. 2 취약 적용.' },
  strike: { name: '스트라이크', description: '6 피해.' },
  defend: { name: '디펜드', description: '5 방어 획득.' },
  anger: { name: '분노', description: '6 피해. 이 카드의 복사본을 버림 더미에 추가.' },
  armaments: { name: '무기 수리', description: '5 방어. 이 전투 중 손에 있는 카드 하나 업그레이드.' },
  body_slam: { name: '바디 슬램', description: '현재 방어량만큼 피해를 입힘.' },
  clash: { name: '교전', description: '손에 있는 모든 카드가 공격일 때만 사용 가능. 14 피해.' },
  cleave: { name: '쪼개기', description: '모든 적에게 8 피해.' },
  clothesline: { name: '클로스라인', description: '12 피해. 2 약화 적용.' },
  flex: { name: '유연성', description: '2 힘 획득. 턴 종료 시 2 힘 감소.' },
  havoc: { name: '강타', description: '드로우 더미 맨 위 카드 플레이 후 소모.' },
  headbutt: { name: '헤드버트', description: '9 피해. 버린 카드 하나를 맨 위로.' },
  heavy_blade: { name: '헤비 블레이드', description: '14 피해. 힘의 영향을 3배로 받음.' },
  iron_wave: { name: '아이언 웨이브', description: '5 방어 획득. 5 피해.' },
  perfected_strike: { name: '완벽한 타격', description: '6 피해 (+ Strike 카드 하나당 +2).' },
  pommel_strike: { name: '폼멜 스트라이크', description: '9 피해. 카드 1장 드로우.' },
  shrug_it_off: { name: '무시하기', description: '8 방어. 카드 1장 드로우.' },
  sword_boomerang: { name: '소드 부메랑', description: '무작위 적 3번 피해 3.' },
  thunderclap: { name: '썬더클랩', description: '모든 적에게 4 피해 및 1 취약 적용.' },
  true_grit: { name: '진정한 용기', description: '7 방어. 손에서 임의 카드 하나 소모.' },
  twin_strike: { name: '트윈 스트라이크', description: '5 피해 2회.' },
  warcry: { name: '전쟁의 외침', description: '카드 1장 드로우. 손에서 카드 한 장을 맨 위로. 소모.' },
  wild_strike: { name: '와일드 스트라이크', description: '12 피해. 상처 한 장을 드로우 더미에 섞음.' },
  battle_trance: { name: '전투 정신', description: '카드 3장 드로우 (추가 드로우 불가).' },
  blood_for_blood: { name: '피를 위한 피', description: '18 피해 (손실 HP에 따라 비용 감소).' },
  bloodletting: { name: '사혈', description: '3 HP 손실. 2 에너지 획득.' },
  burning_pact: { name: '소모의 맹세', description: '카드 하나 소모. 카드 2장 드로우.' },
  carnage: { name: '대학살', description: '에테리얼. 20 피해.' },
  combust: { name: '발화', description: '턴 종료: HP 1 손실, 모든 적에게 5 피해.' },
  dark_embrace: { name: '어둠의 포옹', description: '카드가 소모될 때마다 카드 1장 드로우.' },
  disarm: { name: '무장 해제', description: '적의 힘 2 감소. 소모.' },
  dropkick: { name: '발구차기', description: '적이 공격하려 한다면 5 피해, 에너지 1, 카드 1 드로우.' },
  dual_wield: { name: '이중 무기', description: '손에 있는 공격 또는 파워 카드 복사.' },
  entrench: { name: '참호', description: '현재 방어량 2배.' },
  evolve: { name: '진화', description: '상태 드로우 시 카드 한 장 추가.' },
  feel_no_pain: { name: '고통을 느끼지 않음', description: '카드 소모 시 3 방어 획득.' },
  flame_barrier: { name: '화염 장벽', description: '12 방어. 공격 받을 때마다 4 피해 반사.' },
  ghostly_armor: { name: '유령 갑옷', description: '에테리얼. 10 방어.' },
  hemokinesis: { name: '혈역학', description: '2 HP 손실. 15 피해.' },
  infernal_blade: { name: '지옥의 칼날', description: '무작위 공격 카드 하나를 손에 추가. 이번 턴 코스트 0. 소모.' },
  inflame: { name: '불꽃 폭발', description: '2 힘 획득.' },
  intimidate: { name: '위협', description: '모든 적에게 1 약화. 소모.' },
  metallicize: { name: '금속화', description: '턴 종료 시 3 방어 획득.' },
  power_through: { name: '버티기', description: '15 방어. 상처 2장 손에 추가.' },
  pummel: { name: '난타', description: '2 피해 4회. 소모.' },
  rampage: { name: '광폭화', description: '8 피해. 전투 중 이 카드가 플레이될 때마다 +5 증가.' },
  reckless_charge: { name: '무모한 돌진', description: '7 피해. 임의로 얼간이 카드 하나 섞음.' },
  rupture: { name: '파열', description: '카드 피해로 HP 손실 시 힘 1 획득.' },
  searing_blow: { name: '타오르는 일격', description: '12 피해. (여러 번 업그레이드 가능).' },
  second_wind: { name: '두 번째 바람', description: '모든 비-공격 카드를 소모. 각 카드당 5 방어 획득.' },
  seeing_red: { name: '붉은 빛으로 보기', description: '2 에너지 획득. 소모.' },
  sentinel: { name: '센티넬', description: '5 방어. 소모 시 에너지 2 획득.' },
  sever_soul: { name: '영혼 절단', description: '손에 있는 비-공격 카드를 전부 소모. 16 피해.' },
  spot_weakness: { name: '약점 간파', description: '적이 공격할 경우 힘 3 획득.' },
  uppercut: { name: '어퍼컷', description: '13 피해. 1 약화, 1 취약 적용.' },
  whirlwind: { name: '회오리', description: 'X 에너지: 모든 적에게 X * 5 피해.' },
  barricade: { name: '바리케이드', description: '방어가 턴 종료 시 유지됨.' },
  berserk: { name: '광전사', description: '1 취약 획득. 턴 시작 시 에너지 +1.' },
  bludgeon: { name: '철퇴', description: '32 피해.' },
  brutality: { name: '잔혹함', description: '턴 시작: 1 HP 손실, 카드 1장 드로우.' },
  corruption: { name: '부패', description: '스킬 카드가 0 코스트. 스킬을 플레이하면 소모.' },
  demon_form: { name: '악마 형태', description: '턴 시작: 힘 +2.' },
  double_tap: { name: '이중 타격', description: '다음 공격이 두 번 발동.' },
  exhume: { name: '소생', description: '소모된 카드 하나를 손으로. 소모.' },
  feed: { name: '먹이', description: '10 피해. 처치 시 최대 HP +3. 소모.' },
  fiend_fire: { name: '마귀 불꽃', description: '손에 있는 카드 전부 소모. 각 카드마다 7 피해.' },
  immolate: { name: '소각', description: '모든 적에게 21 피해. 상처 하나 획득.' },
  impervious: { name: '완전 방어', description: '30 방어. 소모.' },
  juggernaut: { name: '저거너트', description: '방어 획득 시마다 임의 적에게 5 피해.' },
  limit_break: { name: '한계 돌파', description: '힘 두 배. 소모.' },
  offering: { name: '바치기', description: '6 HP 손실. 2 에너지, 카드 3장 드로우. 소모.' },
  reaper: { name: '사신', description: '모든 적에게 4 피해. 상대의 남은 방어를 피해로 환산하여 회복. 소모.' },
  shockwave: { name: '충격파', description: '모든 적에게 3 약화, 3 취약. 소모.' },
};

const ORIGINAL_CARD_TEXT = {};
let initialized = false;

function initOriginalCardText() {
  if (initialized) return;
  Object.keys(CARDS).forEach((id) => {
    ORIGINAL_CARD_TEXT[id] = {
      name: CARDS[id].name,
      description: CARDS[id].description,
    };
  });
  initialized = true;
}

function applyCardLanguage(language) {
  initOriginalCardText();

  Object.keys(CARDS).forEach((id) => {
    CARDS[id].name = ORIGINAL_CARD_TEXT[id].name;
    CARDS[id].description = ORIGINAL_CARD_TEXT[id].description;
  });

  if (language !== 'ko') return;

  Object.entries(CARD_KO).forEach(([id, ko]) => {
    if (!CARDS[id]) return;
    CARDS[id].name = ko.name;
    CARDS[id].description = ko.description;
  });

  Object.entries(CARD_UPGRADES).forEach(([baseId, upgradedId]) => {
    const baseKo = CARD_KO[baseId];
    const baseOriginal = ORIGINAL_CARD_TEXT[baseId];
    const upgradedOriginal = ORIGINAL_CARD_TEXT[upgradedId];
    if (!CARDS[upgradedId] || !baseKo || !baseOriginal || !upgradedOriginal) return;

    CARDS[upgradedId].name = baseKo.name + '+';
    if (upgradedOriginal.description.startsWith(baseOriginal.description)) {
      const suffix = upgradedOriginal.description.slice(baseOriginal.description.length);
      CARDS[upgradedId].description = baseKo.description + suffix;
    }
  });
}

function applyStaticUIText(language) {
  const ko = language === 'ko';
  const title = document.querySelector('.game-title');
  if (title) title.textContent = ko ? '⚔ 에테르 크롤' : '⚔ Aether Crawl';

  const asc = document.getElementById('title-ascension');
  if (asc) asc.textContent = ko ? '◈ 계승 강화' : '◈ Ascension';
  const deck = document.getElementById('title-deck');
  if (deck) deck.textContent = ko ? '📖 내 덱' : '📖 Your Deck';
  const cat = document.getElementById('title-catalog');
  if (cat) cat.textContent = ko ? '🗂 조우 카드 도감' : '🗂 Encounter Catalog';
  const relics = document.getElementById('title-relics');
  if (relics) relics.textContent = ko ? '🏺 유물' : '🏺 Relics';

  const ascHint = document.getElementById('hint-ascension');
  if (ascHint) ascHint.textContent = ko
    ? '던전 런에서 얻은 정수로 영구 강화를 구매하세요.'
    : 'Spend essence (earned from dungeon runs) on permanent upgrades.';
  const catHint = document.getElementById('hint-catalog');
  if (catHint) catHint.textContent = ko
    ? '현재 런에서 확인한 카드 목록입니다.'
    : 'Cards discovered in the current run.';

  const modalTitle = document.getElementById('catalog-modal-title');
  if (modalTitle) modalTitle.textContent = ko ? '조우 카드 도감' : 'Encounter Catalog';
  const foldBtn = document.getElementById('catalog-fold-btn');
  if (foldBtn) foldBtn.textContent = ko ? '도감 접기' : 'Fold Catalog';
}

export function applyLanguage(state, language) {
  const lang = language === 'ko' ? 'ko' : 'en';
  if (!state.settings) state.settings = {};
  state.settings.language = lang;
  applyCardLanguage(lang);
  applyStaticUIText(lang);
}

export function currentLanguage(state) {
  return (state && state.settings && state.settings.language === 'ko') ? 'ko' : 'en';
}
