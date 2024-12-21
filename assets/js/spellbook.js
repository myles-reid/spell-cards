'use strict';
import { select, listen, selectAll, create } from './utils.js';
import { cardContent } from './card.js';

const BASE_URL = 'https://www.dnd5eapi.co';
const options = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  },
  mode: 'cors'
}

const spellBookCards = select('.spell-book');
const spellList = select('#spell-list');
const card = select('.card');


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
  const spells = selectAll('.spell');
  const filterValue = filterLevel.value;

  spells.forEach(item => {
    const text = item.innerText.toLowerCase();

    if (text.includes(filterValue)) {
      item.classList.remove('none');
    } else {
      item.classList.add('none');
    }
  });
}

function buildCard(spell) {
  const card = create('div');
  card.innerHTML = cardContent;
  
  const name = select('.spell-name', card);
  const level = select('.spell-level', card);
  const castTime = select('.cast-time', card);
  const range = select('.sp-range', card);
  const area = select('.sp-area', card);
  const components = select('.sp-components', card);
  const duration = select('.sp-duration', card);
  const description = select('.description', card);
  const higherLevel = select('.higher-levels', card);
  const magicSchool = select('.magic-school', card);
  const classes = select('.sp-classes', card);
  const ritualTag = select('.ritual-tag', card);
  
  name.textContent = spell.name;
  level.textContent = spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`;
  castTime.textContent = spell.casting_time;
  range.innerText = spell.range;
  
  if (spell.area_of_effect) {
    document.documentElement.style.setProperty('--pseudo-display', 'in-line');
    area.innerText = spell.area_of_effect.size + 'ft ' + spell.area_of_effect.type;
  } else {
    document.documentElement.style.setProperty('--pseudo-display', 'none');
    area.textContent = '';
  }

  if (spell.ritual && ritualTag.classList.contains('hidden')) {
    ritualTag.classList.remove('hidden');
  } else if (!spell.ritual && !ritualTag.classList.contains('hidden')) {
    ritualTag.classList.add('hidden');
  }

  components.textContent = spell.components.join(', ');  
  duration.textContent = spell.duration;
  description.textContent = spell.desc;
  higherLevel.textContent = spell.higher_level ? spell.higher_level : 'None';
  magicSchool.textContent = spell.school.name;
  classes.textContent = spell.classes.map(c => c.name).join(', ');

  return card;
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
    console.log(spell);
    const card = buildCard(spell);
    spellBookCards.appendChild(card);
  });
});

