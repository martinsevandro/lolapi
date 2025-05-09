const axios = require('axios');


//  runas aka perks
const runesURL = 'https://ddragon.leagueoflegends.com/cdn/15.8.1/data/en_US/runesReforged.json';
let runesData = [];

async function loadRunesData() {
  try {
    const res = await axios.get(runesURL);
    runesData = res.data;
  } catch (err) {
    console.error('Erro ao carregar runas:', err.message);
  }
}


// runas icons (perks)
function getRuneIconUrl(runeId) {
    for (const style of runesData) {
      for (const slot of style.slots) {
        const rune = slot.runes.find(r => r.id === runeId);
        if (rune) return `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`;
      }
    }
    return null;
}
  
// shard perks icons
function getShardIcon(id) {
    const mapping = {
        5001: 'statmodshealthplus', 
        5005: 'statmodsattackspeed', 
        5007: 'statmodscdrscaling', 
        5008: 'statmodsadaptiveforce', 
        5010: 'statmodsmovementspeed', 
        5011: 'statmodshealthscaling', 
        5013: 'statmodstenacity', 
    };

    const file = mapping[id];
    return file ? `https://raw.communitydragon.org/latest/game/assets/perks/statmods/${file}icon.png` : null;
}

// summoners spells icons (flash, ghost, ignite, etc)
const spellsURL = 'https://ddragon.leagueoflegends.com/cdn/15.8.1/data/en_US/summoner.json';
let spellsData = {};

async function loadSpellsData() {
    try {
      const res = await axios.get(spellsURL);
      spellsData = res.data.data;
    } catch (err) {
      console.error('Erro ao carregar summoner spells:', err.message);
    }
}
  

// icone de summoner spells
function getSummonerSpellIcon(spellId) {
    for (const key in spellsData) {
      if (spellsData[key].key === spellId.toString()) {
        return `https://ddragon.leagueoflegends.com/cdn/15.8.1/img/spell/${spellsData[key].id}.png`;
      }
    }
    return null;
}

// itens
const itemDataURL = 'https://ddragon.leagueoflegends.com/cdn/15.8.1/data/en_US/item.json';

let itemsJson = {};
async function loadItemsData() {
    const res = await axios.get(itemDataURL);
    itemsJson = res.data.data;
}

// verificar o servidor informado e usar a rota correta
function getRegionalRoute(platform) {
    platform = platform.toLowerCase().trim();  
    
    const americas = ['br1', 'na1', 'la1', 'la2'];
    const europe = ['euw1', 'eun1', 'tr1', 'ru1'];
    const asia = ['kr', 'kr1', 'jp1'];
    
    if (americas.includes(platform)) return 'americas';
    if (europe.includes(platform)) return 'europe';
    if (asia.includes(platform)) return 'asia';
    
    return 'americas'; // fallback
}

// definir a role do jogador para definir os status que serão mostrados na Carta (devido teamPosition, role, individualPosition conflitarem as vezes)
function defineRole(gameMode, teamPosition, role) {
    if (gameMode === "CLASSIC"){
        if (teamPosition === 'TOP') return 'top';
        if (teamPosition === 'MIDDLE') return 'mid';
        if (teamPosition === 'JUNGLE') return 'jungle';
        if (teamPosition === 'BOTTOM') return 'adc';
        if (teamPosition === '' && role === 'SUPPORT') return 'sup';
        if (teamPosition === 'UTILITY' && role === 'SUPPORT') return 'sup'; // suporte
        if (teamPosition === 'UTILITY' && role === 'SOLO') return 'sup'; // suporte tbm
        return 'sup'; // caso não tenha uma posição definida
    }
    return 'adc'; // fallback para outros modos de jogo, devido a (nota = KDA + ParticipaçãoKills)
}

// definir a nota do jogador (de acordo com a role) - *futuro (atualmente usa apenas kda)
function definePlayerScore(kda, minionsPerMinute, PK, damagePerMinute, visionScore, positionPlayer) {
    switch (positionPlayer) {
        case 'top':
            return (kda + minionsPerMinute);
        case 'jungle':
            return (kda + PK);
        case 'mid':
            return (kda + minionsPerMinute);
        case 'adc':
            return (kda + damagePerMinute);
        case 'sup':
            return (kda + visionScore);
        default:
            return (kda + damagePerMinute); // caso não tenha uma posição definida
    }
}

// definir a posição da skin no array (usando a nota do jogador - maior é melhor)
function defineSkinPosition(skins, k, d, a) {
    if (skins.length === 0) return 0; // se não tiver skins, retorna null
        
    let kda = ((k + a) / Math.max(d, 1)).toFixed(1);
    console.log("kda:", kda);
    
    let quartile = 0;    
    if (kda < 1.0) {
        quartile = 0;
    } else if (kda < 3.0) {
        quartile = 1;
    } else if (kda < 5.0) {
        quartile = 2;
    } else {
        quartile = 3;
    }
    console.log("quartile:", quartile);

    const quartileSize = Math.ceil(skins.length / 4);   //retorna o menor inteiro maior ou igual ao valor
    console.log("quartileSize: ", quartileSize);

    const endIndex = Math.min((quartile + 1) * quartileSize, skins.length); 
          
    const aleatorio = Math.random(); 
    const randomIndex = Math.floor(aleatorio * endIndex);
    
    return randomIndex; 
}

function defineCorDaBorda(k, d, a){
    const kda = ((k + a) / Math.max(d, 1)).toFixed(1);
    console.log("kda:", kda);
     
    if (kda < 2.0) {
        // Bronze 
        return "linear-gradient(45deg, #633B1B, #965F32, #BB8947, #A0652E)";
    } else if (kda < 4.0) {
        // Prata 
        return "linear-gradient(45deg,rgb(146, 146, 146),rgb(209, 209, 209),rgb(235, 235, 235),rgb(177, 177, 177))";
    } else {
        // Ouro ou Roxo
        // return "linear-gradient(45deg, #FFD700, #FFB300, #FF9E00, #E1A700)"; 
        return "linear-gradient(45deg, #1A002B, #3D0066, #6A0DAD, #39114D)";
    }
}

const commonStyle = 'font-family: Arial; font-weight: 600; color: white; -webkit-text-stroke: 0.1px black; text-shadow: 0 0 9px black;';

const styledSpan = (content, className = '') =>
  `<span style="${commonStyle}" class="${className}">${content}</span>`;


module.exports = {
    loadRunesData,
    getRuneIconUrl,
    getShardIcon,
    loadSpellsData,
    getSummonerSpellIcon,
    loadItemsData,
    getRegionalRoute,
    defineRole,
    definePlayerScore,
    defineSkinPosition,
    defineCorDaBorda,
    commonStyle,
    styledSpan,
};