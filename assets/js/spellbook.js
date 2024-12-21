'use strict';
import { select, listen, selectAll, create } from './utils.js';
import { buildCard } from './card.js';

const BASE_URL = 'https://www.dnd5eapi.co';
const options = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  },
  mode: 'cors'
}

const spellBookCards = select('.spell-book');
const filterLevel = select('#level');
const filterBtn = select('.filter');


function getSpellBook() {
  let spells = localStorage.getItem('spellBook');
  return spells ? JSON.parse(spells) : [];
}

async function getAllSpells() {
  try {
    const spellIndexes = await fetch(BASE_URL + '/api/spells', options);

    if (!spellIndexes.ok) {
      throw new Error(`${spellIndexes.statusText} (${spellIndexes.status})`);
    }

    const data = await spellIndexes.json();
    const spells = data.results;
    return spells;
  } catch (error) {
    console.log(error.message);
  }
}

async function findSpell(spell) {
  const spells = await getAllSpells();

  if (spells) {
    const spellNames = spells.map(s => s.index.toLowerCase());
    if (spellNames.includes(spell.toLowerCase())) {
      let spellIndex = spellNames.indexOf(spell.toLowerCase());
      return spells[spellIndex];
    }
  }
  return null;
}

async function getSpellDetails(spell) {
  const spellData = await findSpell(spell);
  if (spellData) {
    const spellUrl = spellData.url;
    const response = await fetch(`https://www.dnd5eapi.co${spellUrl}`, options);
    const spellInfo = await response.json();
    return spellInfo;
  }
}

function filterSpells() {
  const spells = selectAll('.card');
  const filterValue = filterLevel.value;

  spells.forEach(item => {
    let level = item.dataset.level;
    if (level === filterValue || filterValue === 'all') {
      item.classList.remove('none');
    } else {
      item.classList.add('none');
    }
  });
}

const sortedSpellBook = [];
async function populateSpellBook() {
  const spellBook = getSpellBook();
  const spellPromises = spellBook.map(spell => getSpellDetails(spell));

  const spellInfos = await Promise.all(spellPromises);
  spellInfos.forEach(spellInfo => { 
      if (spellInfo) {
        sortedSpellBook.push(spellInfo);
      }
    });
    sortedSpellBook.sort((a, b) => a.level - b.level);
  }

listen('load', window, async () => {
  await populateSpellBook();
  sortedSpellBook.forEach(spell => {
    const card = buildCard(spell);
    spellBookCards.appendChild(card);
  });
});

listen('click', filterBtn, filterSpells);

