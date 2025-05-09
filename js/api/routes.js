const express = require('express');
const axios = require('axios');
const router = express.Router();
module.exports = router;

const {
    loadRunesData,
    loadSpellsData,
    loadItemsData,
    getRegionalRoute,
    // definePlayerScore,   // futura definicao pra evitar kda players
    defineSkinPosition,
} = require('./helpers.js');

const createFilteredData = require('../services/dataFilter.js');

// Carregar os dados externos apenas uma vez no inicio
loadRunesData();
loadSpellsData();
loadItemsData();

// Encontrar o PUUID através do nome, tag e servidor
router.get('/api/player/:name/:tag/:server', async (req, res) => {

    const { name, tag, server } = req.params; 
    const region = getRegionalRoute(server);  

    try {
        const response = await axios.get(
            `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tag}`, 
            {
                headers: {
                    'X-Riot-Token': process.env.RIOT_API_KEY
                }
            }
            
        );
        
        res.json(response.data); 
    } catch (error) {
        console.error('Erro ao buscar conta:', error.message);
        res.status(500).json({ error: 'Erro ao buscar a conta na API da Rito' });
    }
});

// Encontrar os dados usando matchId informado
router.get('/api/matches/lol/last/:puuid/:platform/:matchId', async (req, res) => {

    const { puuid, platform, matchId } = req.params;
    const regionalRoute = getRegionalRoute(platform); 

    try {
        // Buscar a partida do patrao
        const matchDetailsResponse = await axios.get(
            `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
            {
                headers: {
                    'X-Riot-Token': process.env.RIOT_API_KEY,
                },
            }
        );

        const matchData = matchDetailsResponse.data;

        // Achar os dados do jogador com o PUUID
        const playerStats = matchData.info.participants.find(p => p.puuid === puuid);

        if (!playerStats) {
            return res.status(404).json({ error: 'Jogador não encontrado na partida.' });
        }

        // splashArt card do campeão
        const championJsonUrl = `http://ddragon.leagueoflegends.com/cdn/15.8.1/data/en_US/champion/${playerStats.championName}.json`;

        let splashArtUrl = null;       

        try {
            const champRes = await axios.get(championJsonUrl);
            const skins = champRes.data.data[playerStats.championName].skins;                   

            const skinPosition = defineSkinPosition(skins, playerStats.kills, playerStats.deaths, playerStats.assists);
            const selectedSkinNum = skins[skinPosition]?.num ?? skins[0].num;

            splashArtUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${playerStats.championName}_${selectedSkinNum}.jpg`;
        } catch (err) {
            console.error("Erro ao buscar skin do campeão:", err.message);
        }

        const filteredData = createFilteredData(matchData, playerStats, splashArtUrl);
        
        res.json(filteredData);        

    } catch (error) {
        console.error('Erro ao buscar a partida:', error.message);
        res.status(500).json({ error: 'Erro ao buscar a partida' });
    }
});

// // testando - Nova rota que retorna os dados da última partida do jogador
router.get('/api/matches/lol/last/:puuid/:platform', async (req, res) => {
    
    const { puuid, platform } = req.params;
    const regionalRoute = getRegionalRoute(platform); 

    try {
        // Passo 1: Buscar a última partida (só 1)
        const matchIdsResponse = await axios.get(
            `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=1`,
            {
                headers: {
                    'X-Riot-Token': process.env.RIOT_API_KEY,
                },
            }
        );

        const [lastMatchId] = matchIdsResponse.data; 
        if (!lastMatchId) return res.status(404).json({ error: 'Nenhuma partida encontrada.' });

        // redireciona internamente para a outra rota
        res.redirect(`/api/matches/lol/last/${puuid}/${platform}/${lastMatchId}`);
        
    } catch (err) {
        console.error('Erro ao buscar ID da última partida:', err.message);
        res.status(500).json({ error: 'Erro ao buscar a última partida.' });
    }
});
