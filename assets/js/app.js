'use strict';

import { select, listen, selectAll } from './utils.js';

const BASE_URL = 'https://www.dnd5eapi.co';

const options = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  },
  mode: 'cors'
}

const filterLevel = select('#level');
const filter = select('.filter');
const spellList = select('#spell-list');
const spellCard = select('.card');
const name = select('.spell-name');
const level = select('.spell-level');
const castTime = select('.cast-time');
const range = select('.sp-range');
const area = select('.sp-area');
const components = select('.sp-components');
const duration = select('.sp-duration');
const description = select('.description');
const higherLevel = select('.higher-levels');
const magicSchool = select('.magic-school');
const classes = select('.sp-classes');
const ritualTag = select('.ritual-tag');
const addSpell = select('.add-spell');

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
    const spellNames = spells.map(s => s.name.toLowerCase());
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

let selectedSpell;
async function listAllSpells() {
  const spells = await getAllSpells();
  
  if (spells) {
    spells.sort((a, b) => a.level - b.level);
    spells.forEach(spell => {
      let name = spell.name;
      let level = spell.level;
      buildSpellList(name, level);
    })
  }
  const listedSpells = selectAll('.spell');

  listedSpells.forEach(spell => {

    listen('focus', spell, async function() {
      const spellName = spell.querySelector('h4').textContent;
      const spellInfo = await getSpellDetails(spellName);
      
      if (spellInfo) {

        if (spellCard.classList.contains('hidden')) {
          spellCard.classList.remove('hidden');
        }
        
        displaySpellInfo(spellInfo);
        selectedSpell = spellInfo.index;
        console.log(selectedSpell);
      }
    });
  });
}

function buildSpellList(name, level) {
  if (level === 0) {
    level = 'Cantrip';
    spellList.innerHTML += `
    <li class="spell" tabindex=0><p>${level}</p><h4>${name}</h4></li>
    `; 
  } else {
  spellList.innerHTML += `
  <li class="spell" tabindex=0><p>Level ${level}</p><h4>${name}</h4></li>
  `;
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

function displaySpellInfo(spell) {
  name.textContent = spell.name;
  level.textContent = spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`;
  castTime.textContent = spell.casting_time;
  range.innerText = spell.range;

  setAreaOfEffect(spell);
  setRitualTag(spell);
  
  components.textContent = spell.components.join(', ');  
  duration.textContent = spell.duration;
  description.textContent = spell.desc;
  higherLevel.textContent = spell.higher_level ? spell.higher_level : 'None';
  magicSchool.textContent = spell.school.name;
  classes.textContent = spell.classes.map(c => c.name).join(', ');

}

function setAreaOfEffect(spell) {
  if (spell.area_of_effect) {
    area.innerText = ` / ${spell.area_of_effect.size}ft ${spell.area_of_effect.type}`;
  } else {
    area.textContent = '';
  }
}

function setRitualTag(spell) {
  if (spell.ritual && ritualTag.classList.contains('hidden')) {
    ritualTag.classList.remove('hidden');
  } else if (!spell.ritual && !ritualTag.classList.contains('hidden')) {
    ritualTag.classList.add('hidden');
  }
}

const spellBook = [];
function addSpellToBook() {
  if(!selectedSpell) return;
  spellBook.push(selectedSpell);
  if (localStorage.getItem('spellBook')) {
    const storedBook = JSON.parse(localStorage.getItem('spellBook'));
    storedBook.push(selectedSpell);
    localStorage.setItem('spellBook', JSON.stringify(storedBook));
  } else {
  localStorage.setItem('spellBook', JSON.stringify(spellBook));
  }
}




listAllSpells();
listen('click', filter, () => {
  filterSpells();
});

listen('click', addSpell, () => {
  addSpellToBook();
})

