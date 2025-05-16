const express = require('express');
const axios = require('axios');
const router = express.Router();
module.exports = router;

const {
    loadRunesData,
    loadAugmentsData,
    loadSpellsData,
    loadItemsData,
    getRegionalRoute,
    // definePlayerScore,   // futura definicao pra evitar kda players
    defineSkinPosition,
} = require('./helpers.js');

const createFilteredData = require('../services/dataFilter.js');

// Carregar os dados externos apenas uma vez no inicio
loadRunesData();
loadAugmentsData();
loadSpellsData();
loadItemsData();

// Encontrar o PUUID através do nome, tag e servidor
router.get('/api/player/:name/:tag/:server', async (req, res) => {

    const { name, tag, server } = req.params; 
    const region = getRegionalRoute(server);  

    try {
        const axiosConfig = {
            headers: { 'X-Riot-Token': process.env.RIOT_API_KEY },
            validateStatus: (status) => status < 500 // Aceitar status de erro 4xx
        };

        const response = await axios.get(
            `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tag}`, 
            axiosConfig
            
        );

        // Tratamento específico para 403 (API key inválida)
        if (response.status === 403) {
            return res.status(403).json({
                error: 'Acesso negado pela API Riot',
                details: response.data?.status?.message || 'Verifique sua API key',
                riotError: response.data
            });
        }

        // Tratamento para 404 (jogador não encontrado)
        if (response.status === 404) {
            return res.status(404).json({
                error: 'Jogador não encontrado',
                details: 'Verifique o Riot ID e região informados'
            });
        }

        // Tratamento para outros códigos de erro
        if (!response.data || !response.data.puuid) {
            return res.status(response.status).json({
                error: 'Erro ao buscar conta',
                details: response.data?.status?.message || 'Resposta inválida da API'
            });
        }
        
        res.json(response.data); 
    } catch (error) {
        console.error('Erro ao buscar conta:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data
        });

        // Mantém o status code original da Riot ou usa 500 se não houver resposta
        res.status(err.response?.status || 500).json({
            error: err.response?.data?.status?.message || 'Erro ao buscar a conta na API da Rito',
            details: error.message,
            riotError: err.response?.data
        });
    }
});

// Encontrar os dados usando matchId informado
router.get('/api/matches/lol/last/:puuid/:platform/:matchId', async (req, res) => {

    const { puuid, platform, matchId } = req.params;
    const regionalRoute = getRegionalRoute(platform); 

    try {
        // config axios para não ter erro automatico
        const axiosConfig = {
            headers: { 'X-Riot-Token': process.env.RIOT_API_KEY },
            validateStatus: (status) => status < 500 // Aceitar status de erro 4xx
        };

        // Buscar a partida do patrao
        const matchDetailsResponse = await axios.get(
            `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
            axiosConfig
        );

        // Verifica se a resposta é 403 (devido modo novo que veio ausente)
        if (matchDetailsResponse.status === 403) {
            return res.status(403).json({
                error: 'Acesso negado pela API', 
                details: matchDetailsResponse.data?.status?.message || 'Verifique a API Key'
            });
        }

        // Outros codigos de erros
        if (!matchDetailsResponse.data){
            return res.status(matchDetailsResponse.status).json({
                error: 'Erro ao buscar a partida',
                details: matchDetailsResponse.data
            });
        }

        const matchData = matchDetailsResponse.data;

        // Achar os dados do jogador com o PUUID
        const playerStats = matchData.info.participants.find(p => p.puuid === puuid);

        const duoStats = matchData.info.participants.find(p => p.puuid !== puuid && p.subteamPlacement === playerStats.subteamPlacement);

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
            iconChampionUrl = `https://ddragon.leagueoflegends.com/cdn/15.8.1/img/champion/${duoStats.championName}.png`;
        } catch (err) {
            console.error("Erro ao buscar skin do campeão:", err.message);
        }

        const filteredData = createFilteredData(matchData, playerStats, splashArtUrl, iconChampionUrl);
        
        res.json(filteredData);        

    } catch (error) {
        console.error('Erro completo:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });

        // Mantém o status code original ou usa 500 se não houver resposta
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.status?.message || 'Erro ao processar a partida',
            details: error.message
        });
    }
});

// // testando - Nova rota que retorna os dados da última partida do jogador
router.get('/api/matches/lol/last/:puuid/:platform', async (req, res) => {
    
    const { puuid, platform } = req.params;
    const regionalRoute = getRegionalRoute(platform); 

    try {
        const axiosConfig = {
            headers: { 'X-Riot-Token': process.env.RIOT_API_KEY },
            validateStatus: (status) => status < 500 
        };
        // Passo 1: Buscar a última partida (só 1)
        const matchIdsResponse = await axios.get(
            `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=1`,
            axiosConfig
        );

        // Verifica se a resposta é 403 (devido modo novo que veio ausente)
        if (matchIdsResponse.status === 403) {
            return res.status(403).json({
                error: 'Acesso negado pela API', 
                details: matchIdsResponse.data?.status?.message || 'Verifique a API Key'
            });
        }

        // Outros codigos de erros
        if (!matchIdsResponse.data){
            return res.status(matchIdsResponse.status).json({
                error: 'Erro ao buscar a partida',
                details: matchIdsResponse.data
            });
        }

        const [lastMatchId] = matchIdsResponse.data; 
        if (!lastMatchId) return res.status(404).json({ error: 'Nenhuma partida encontrada.' });

        // redireciona internamente para a outra rota
        res.redirect(`/api/matches/lol/last/${puuid}/${platform}/${lastMatchId}`);
        
    } catch (err) {
        console.error('Erro ao buscar ID da última partida:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data
        });

        // Mantém o status code original da Riot ou usa 500 se não houver resposta
        res.status(err.response?.status || 500).json({
            error: err.response?.data?.status?.message || 'Erro ao buscar a última partida',
            riotError: err.response?.data
        });
    }
});
