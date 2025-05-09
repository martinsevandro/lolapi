// dependencias
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

// carregas as variaveis de ambiente (do .env)
dotenv.config();

// inicializando o app do express
const app = express();
const PORT = process.env.PORT || 3001; // posso alterar essa porta depois

// Middlewares 
app.use(cors());

// rotas
const routes = require('./js/api/routes.js');
app.use('', routes);

// funções auxiliares de helpers
const {
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

} = require('./js/api/helpers.js');

loadRunesData();
loadSpellsData();
loadItemsData();


// funcoes que estarão em helpers.js

// //  runas aka perks
// const runesURL = 'https://ddragon.leagueoflegends.com/cdn/15.8.1/data/en_US/runesReforged.json';
// let runesData = [];

// async function loadRunesData() {
//   try {
//     const res = await axios.get(runesURL);
//     runesData = res.data;
//   } catch (err) {
//     console.error('Erro ao carregar runas:', err.message);
//   }
// }

// loadRunesData();

// // runas icons (perks)
// function getRuneIconUrl(runeId) {
//     for (const style of runesData) {
//       for (const slot of style.slots) {
//         const rune = slot.runes.find(r => r.id === runeId);
//         if (rune) return `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`;
//       }
//     }
//     return null;
// }
  
// // shard perks icons
// function getShardIcon(id) {
//     const mapping = {
//         5001: 'statmodshealthplus', 
//         5005: 'statmodsattackspeed', 
//         5007: 'statmodscdrscaling', 
//         5008: 'statmodsadaptiveforce', 
//         5010: 'statmodsmovementspeed', 
//         5011: 'statmodshealthscaling', 
//         5013: 'statmodstenacity', 
//     };

//     const file = mapping[id];
//     return file ? `https://raw.communitydragon.org/latest/game/assets/perks/statmods/${file}icon.png` : null;
// }

// // summoners spells icons (flash, ghost, ignite, etc)
// const spellsURL = 'https://ddragon.leagueoflegends.com/cdn/15.8.1/data/en_US/summoner.json';
// let spellsData = {};

// async function loadSpellsData() {
//     try {
//       const res = await axios.get(spellsURL);
//       spellsData = res.data.data;
//     } catch (err) {
//       console.error('Erro ao carregar summoner spells:', err.message);
//     }
// }
  
// loadSpellsData();

// // icone de summoner spells
// function getSummonerSpellIcon(spellId) {
//     for (const key in spellsData) {
//       if (spellsData[key].key === spellId.toString()) {
//         return `https://ddragon.leagueoflegends.com/cdn/15.8.1/img/spell/${spellsData[key].id}.png`;
//       }
//     }
//     return null;
// }

// // itens
// const itemDataURL = 'https://ddragon.leagueoflegends.com/cdn/15.8.1/data/en_US/item.json';

// let itemsJson = {};
// async function loadItemsData() {
//     const res = await axios.get(itemDataURL);
//     itemsJson = res.data.data;
// }
// loadItemsData();

// // verificar o servidor informado e usar a rota correta
// function getRegionalRoute(platform) {
//     const americas = ['br1', 'na1', 'la1', 'la2'];
//     const europe = ['euw1', 'eun1', 'tr1', 'ru'];
//     const asia = ['kr', 'kr1', 'jp1'];
    
//     if (americas.includes(platform)) return 'americas';
//     if (europe.includes(platform)) return 'europe';
//     if (asia.includes(platform)) return 'asia';
    
//     return 'americas'; // fallback
// }

// // definir a role do jogador para definir os status que serão mostrados na Carta
// function defineRole(gameMode, teamPosition, role) {
//     if (gameMode === "CLASSIC"){
//         if (teamPosition === 'TOP') return 'top';
//         if (teamPosition === 'MIDDLE') return 'mid';
//         if (teamPosition === 'JUNGLE') return 'jungle';
//         if (teamPosition === 'BOTTOM') return 'adc';
//         if (teamPosition === '' && role === 'SUPPORT') return 'sup';
//         if (teamPosition === 'UTILITY' && role === 'SUPPORT') return 'sup'; // suporte
//         if (teamPosition === 'UTILITY' && role === 'SOLO') return 'sup'; // suporte tbm
//         return 'sup'; // caso não tenha uma posição definida
//     }
//     return 'adc'; // fallback para outros modos de jogo, devido a (nota = KDA + ParticipaçãoKills)
// }

// // definir a nota do jogador (de acordo com a role) - *futuro projeto (atualmente usa apenas kda)
// function definePlayerScore(kda, minionsPerMinute, PK, damagePerMinute, visionScore, positionPlayer) {
//     switch (positionPlayer) {
//         case 'top':
//             return (kda + minionsPerMinute);
//         case 'jungle':
//             return (kda + PK);
//         case 'mid':
//             return (kda + minionsPerMinute);
//         case 'adc':
//             return (kda + damagePerMinute);
//         case 'sup':
//             return (kda + visionScore);
//         default:
//             return (kda + damagePerMinute); // caso não tenha uma posição definida
//     }
// }

// // definir a posição da skin no array (usando a nota do jogador - maior é melhor)
// function defineSkinPosition(skins, k, d, a) {
//     if (skins.length === 0) return 0; // se não tiver skins, retorna null
    
//     // funcao calcular o kda
//     let kda = ((k + a) / Math.max(d, 1)).toFixed(1);
//     console.log("kda:", kda);
    
//     let quartile = 0;
    
//     if (kda < 1.0) {
//         quartile = 0;
//     } else if (kda >= 1.0 && kda < 3.0) {
//         quartile = 1;
//     } else if (kda >= 3.0 && kda < 5.0) {
//         quartile = 2;
//     } else {
//         quartile = 3;
//     }
    
//     const quartileSize = Math.ceil(skins.length / 4);

//     const startIndex = quartile * quartileSize;
//     const endIndex = Math.min(startIndex + quartileSize, skins.length);

//     console.log("skins[skins.length-1]:", skins.length-1);
    
//     if (startIndex >= skins.length) return skins.length-1; 
    
//     const randomIndex = Math.floor(Math.random() * (endIndex - startIndex)) + startIndex;
    
//     console.log("randomIndex:", randomIndex);
//     console.log("skins[randomIndex]:", skins[randomIndex]);

//     return randomIndex; 
// }

// function defineCorDaBorda(k, d, a){
//     const kda = ((k + a) / Math.max(d, 1)).toFixed(1);
//     console.log("kda:", kda);
     
//     if (kda < 2.0) {
//         return "#532D0A"; // #532D0A
//     } else if (kda >= 2.0 && kda < 6.0) {
//         return "#E5E4E2"; // #E5E4E2
//     } else {
//         return "#FFECB3"; // #FFECB3
//     }
// }


// // rota para buscar conta pela PUUID (ok)
// app.get('/api/player/:name/:tag/:server', async (req, res) => {
//     const { name, tag, server } = req.params; 
//     const region = getRegionalRoute(server);  

//     try {
//         const response = await axios.get(
//             `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tag}`, 
//             {
//                 headers: {
//                     'X-Riot-Token': process.env.RIOT_API_KEY
//                 }
//             }
            
//         );

//         res.json(response.data); // retorna os dados do jogador
//     } catch (error) {
//         console.error('Erro ao buscar conta:', error.message);
//         res.status(500).json({ error: 'Erro ao buscar a conta na API da Rito' });
//     }
// });

// // testando - Nova rota que retorna os dados da última partida do jogador
// app.get('/api/matches/lol/last/:puuid/:platform', async (req, res) => {
    
//     const { puuid, platform } = req.params;
//     const regionalRoute = getRegionalRoute(platform); // Chama a função para obter a rota regional

//     try {
//         // Passo 1: Buscar a última partida (só 1)
//         const matchIdsResponse = await axios.get(
//             `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=1`,
//             {
//                 headers: {
//                     'X-Riot-Token': process.env.RIOT_API_KEY,
//                 },
//             }
//         );

//         const [lastMatchId] = matchIdsResponse.data;

//         // Passo 2: Detalhes da partida
//         const matchDetailsResponse = await axios.get(
//             `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/${lastMatchId}`,
//             {
//                 headers: {
//                     'X-Riot-Token': process.env.RIOT_API_KEY,
//                 },
//             }
//         );

//         const matchData = matchDetailsResponse.data;

//         // Passo 3: Achar os dados do jogador com o PUUID
//         const playerStats = matchData.info.participants.find(p => p.puuid === puuid);

//         if (!playerStats) {
//             return res.status(404).json({ error: 'Jogador não encontrado na partida.' });
//         }

//         // splashArt card do campeão
//         const championJsonUrl = `http://ddragon.leagueoflegends.com/cdn/15.8.1/data/en_US/champion/${playerStats.championName}.json`;

//         let splashArtUrl = null;

//             // funcao calcular o kda
        

//         try {
//             const champRes = await axios.get(championJsonUrl);
//             const skins = champRes.data.data[playerStats.championName].skins;                   

//             const skinPosition = defineSkinPosition(skins, playerStats.kills, playerStats.deaths, playerStats.assists);
//             const selectedSkinNum = skins[skinPosition]?.num ?? skins[0].num;

//             splashArtUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${playerStats.championName}_${selectedSkinNum}.jpg`;
//         } catch (err) {
//             console.error("Erro ao buscar skin do campeão:", err.message);
//         }



//         // Passo 4: Montar objeto limpo
//         const filteredData = {
//             // summonerName: playerStats.summonerName,
//             gameMode: matchData.info.gameMode,
//             championName: playerStats.championName,
//             riotIdGameName: playerStats.riotIdGameName,
//             riotIdTagline: playerStats.riotIdTagline,
//             positionPlayer: playerStats.teamPosition,
//             role: playerStats.role,
//             realRole: defineRole(matchData.info.gameMode, playerStats.teamPosition, playerStats.role),
//             kills: playerStats.kills,
//             deaths: playerStats.deaths,
//             assists: playerStats.assists,
//             kda: ((playerStats.kills + playerStats.assists) / Math.max(playerStats.deaths, 1)).toFixed(1),
//             killParticipation: (100*playerStats.challenges.killParticipation).toFixed(2),
//             totalDamageDealtToChampions: playerStats.totalDamageDealtToChampions,
//             totalMinionsKilled: playerStats.totalMinionsKilled,
//             totalNeutralMinionsKilled: playerStats.neutralMinionsKilled,
//             totalMinionsKilledJg: (playerStats.totalMinionsKilled + playerStats.neutralMinionsKilled),
//             teamId: playerStats.teamId,
//             teamDragonsKilled: playerStats.challenges.dragonTakedowns,
//             teamBaronsKilled: playerStats.challenges.baronTakedowns,
//             matchDragons: (matchData.info.teams[0].objectives.dragon.kills + matchData.info.teams[1].objectives.dragon.kills),
//             matchBarons: (matchData.info.teams[0].objectives.baron.kills + matchData.info.teams[1].objectives.baron.kills),
//             jungleKing: ((playerStats.challenges.dragonTakedowns == (matchData.info.teams[0].objectives.dragon.kills + matchData.info.teams[1].objectives.dragon.kills))
//              && (playerStats.challenges.baronTakedowns == (matchData.info.teams[0].objectives.baron.kills + matchData.info.teams[1].objectives.baron.kills))),
//             gameLength: matchData.info.gameDuration,
//             damagePerMinute: playerStats.challenges.damagePerMinute.toFixed(2),
//             minionsPerMinute: ((playerStats.totalMinionsKilled)/(matchData.info.gameDuration/60)).toFixed(1),
//             minionsPerMinuteJg: ((playerStats.totalMinionsKilled + playerStats.neutralMinionsKilled)/(matchData.info.gameDuration/60)).toFixed(1),
//             goldPerMinute: playerStats.challenges.goldPerMinute.toFixed(2),
//             timeCCingOthers: playerStats.timeCCingOthers,
//             visionScore: playerStats.visionScore,
//             firstBloodKill: playerStats.firstBloodKill,
//             firstBloodAssist: playerStats.firstBloodAssist,
//             totalDamageShieldedOnTeammates: playerStats.totalDamageShieldedOnTeammates,
//             totalHealsOnTeammates: playerStats.totalHealsOnTeammates, 
//             totalDamageTaken: playerStats.totalDamageTaken,
//             firstTowerKill: playerStats.firstTowerKill,
//             firstTowerAssist: playerStats.firstTowerAssist,
//             baronKills: playerStats.baronKills,
//             dragonKills: playerStats.dragonKills,
//             quadraKills: playerStats.quadraKills,
//             pentaKills: playerStats.pentaKills,
//             splashArt: splashArtUrl,
//             corDaBorda: defineCorDaBorda(playerStats.kills, playerStats.deaths, playerStats.assists),
//             perks: {
//                 defense: getShardIcon(playerStats.perks.statPerks.defense),
//                 flex: getShardIcon(playerStats.perks.statPerks.flex),
//                 offense: getShardIcon(playerStats.perks.statPerks.offense),
//                 primaryStyle: getRuneIconUrl(playerStats.perks.styles[0].selections[0].perk),
//                 primaryStyleSec: getRuneIconUrl(playerStats.perks.styles[0].selections[1].perk),
//                 primaryStyleTert: getRuneIconUrl(playerStats.perks.styles[0].selections[2].perk),
//                 primaryStyleQuat: getRuneIconUrl(playerStats.perks.styles[0].selections[3].perk),
//                 subStyle: getRuneIconUrl(playerStats.perks.styles[1].selections[0].perk),
//                 subStyleSec: getRuneIconUrl(playerStats.perks.styles[1].selections[1].perk),
//             },
//             summonerSpells: {
//                 spell1: getSummonerSpellIcon(playerStats.summoner1Id),
//                 spell2: getSummonerSpellIcon(playerStats.summoner2Id),
//             },
//             items: [
//                 playerStats.item0,
//                 playerStats.item1,
//                 playerStats.item2,
//                 playerStats.item3,
//                 playerStats.item4,
//                 playerStats.item5,
//                 playerStats.item6,
//             ],
//             gameDate: new Date(matchData.info.gameStartTimestamp).toLocaleDateString('pt-BR', {
//                 day: '2-digit',
//                 month: '2-digit',
//                 year: 'numeric'
//             }),
//         };
        
//         res.json(filteredData);
        

//     } catch (error) {
//         console.error('Erro ao buscar última partida:', error.message);
//         res.status(500).json({ error: 'Erro ao buscar última partida' });
//     }
// });

// // rota para partidas recentes de lol pelo puuid do usuario (ok)
// app.get('/api/matches/lol/:puuid/:platform', async (req, res) => {
//     const { puuid, platform } = req.params; 

//     const regionalRoute = getRegionalRoute(platform);

//     try {
//         const response = await axios.get(
//             `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`, 
//             {
//                 headers: {
//                     'X-Riot-Token': process.env.RIOT_API_KEY,
//                 },
//             }
//         );

//         res.json(response.data);  
//     } catch (error) {
//         console.error('Erro ao buscar partidas:', error.message);
//         res.status(500).json({ error: 'Erro ao buscar historico de partidas' });
//     }
// });

// // rota para detalhes de uma partida especifica 
// app.get('/api/matches/lol/details/:matchId/:platform', async (req, res) => {
//     const { matchId, platform } = req.params; // pega o matchId da url

//     const regionalRoute = getRegionalRoute(platform);
    
//     try {
//         const response = await axios.get(
//             `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/${matchId}`, 
//             {
//                 headers: {
//                     'X-Riot-Token': process.env.RIOT_API_KEY,
//                 },
//             }
//         );

//         res.json(response.data); // retorna os dados da partida
//     } catch (error) {
//         console.error('Erro ao buscar detalhes da partida:', error.message);
//         res.status(500).json({ error: 'Erro ao buscar detalhes da partida' });
//     }
// });



// iniciar server
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

