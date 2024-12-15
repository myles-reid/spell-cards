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
const button = select('.button');
const spellList = select('#spell-list');
const spellCard = select('.card');

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

    listen('click', spell, async function() {
      const spellName = spell.querySelector('h4').textContent;
      const spellInfo = await getSpellDetails(spellName);
      
      if (spellInfo) {
        displaySpellInfo(spellInfo);
      }
    });
  });
}

function displaySpellInfo(spell) {
  spellCard.innerHTML = `
  <h2>${spell.name}</h2>
  <p>Level: ${spell.level}</p>
  <p>${spell.desc}</p>
  <p>Range: ${spell.range}</p>
  <p>Duration: ${spell.duration}</p>
  <p>Casting Time: ${spell.casting_time}</p>
  <p>Damage Type: ${spell.damage ? spell.damage.damage_type.name : 'None'}</p>
  <p>Higher Level: ${spell.higher_level ? spell.higher_level : 'None'}</p>
  `;
}


function buildSpellList(name, level) {
  if (level === 0) {
    level = 'Cantrip';
    spellList.innerHTML += `
    <li class="spell"><p>${level}</p><h4>${name}</h4></li>
    `; 
  } else {
  spellList.innerHTML += `
  <li class="spell"><p>Level ${level}</p><h4>${name}</h4></li>
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

listAllSpells();
listen('click', button, () => {
  filterSpells();
});
