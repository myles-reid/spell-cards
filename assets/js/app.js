'use strict';

import { select, listen } from './utils.js';

const API_URL = 'https://www.dnd5eapi.co/api/spells';

const options = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  },
  mode: 'cors'
}

const input = select('#search');
const button = select('.button');

async function getAllSpells() {
  try {
    const response = await fetch(API_URL, options);

    if (!response.ok) {
      throw new Error(`${response.statusText} (${response.status})`);
    }

      const data = await response.json();
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
    console.log(spellInfo);
  }
}

// button.addEventListener('click', () => {
//   console.log('WTF');
// });

listen('click', button, () => {
  let spell = input.value;
  getSpellDetails(spell);
});
