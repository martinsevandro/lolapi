const {
    defineRole,
    defineCorDaBordaFrontal,
    defineCorVerso,
    getShardIcon,
    getRuneIconUrl,
    getSummonerSpellIcon,
    getItemIcon,
    getAugmentIconUrl,

} = require('../api/helpers.js');

function createFilteredData(matchData, playerStats, splashArtUrl, iconChampionUrl) {
    const challenges = playerStats.challenges || {};

    return {
        gameMode: matchData.info.gameMode,
        championName: playerStats.championName,
        riotIdGameName: playerStats.riotIdGameName,
        riotIdTagline: playerStats.riotIdTagline,
        positionPlayer: playerStats.teamPosition,
        role: playerStats.role,
        realRole: defineRole(matchData.info.gameMode, playerStats.teamPosition, playerStats.role),

        kills: playerStats.kills,
        deaths: playerStats.deaths,
        assists: playerStats.assists,
        kda: ((playerStats.kills + playerStats.assists) / Math.max(playerStats.deaths, 1)).toFixed(1),
        killParticipation: challenges.killParticipation !== undefined 
            ? (100 * challenges.killParticipation).toFixed(2)
            : undefined,

        totalDamageDealtToChampions: playerStats.totalDamageDealtToChampions,
        totalMinionsKilled: playerStats.totalMinionsKilled,
        totalNeutralMinionsKilled: playerStats.neutralMinionsKilled,
        totalMinionsKilledJg: (playerStats.totalMinionsKilled + playerStats.neutralMinionsKilled),
        teamId: playerStats.teamId,

        teamDragonsKilled: challenges.dragonTakedowns,
        teamBaronsKilled: challenges.baronTakedowns,
        matchDragons: (matchData.info.teams[0].objectives.dragon.kills + matchData.info.teams[1].objectives.dragon.kills),
        matchBarons: (matchData.info.teams[0].objectives.baron.kills + matchData.info.teams[1].objectives.baron.kills),
        jungleKing: 
            challenges.dragonTakedowns === (
                matchData.info.teams[0].objectives.dragon.kills + matchData.info.teams[1].objectives.dragon.kills
            ) && 
            challenges.baronTakedowns === (
                matchData.info.teams[0].objectives.baron.kills + matchData.info.teams[1].objectives.baron.kills
            ),
        
        gameLength: matchData.info.gameDuration,
        damagePerMinute: challenges.damagePerMinute !== undefined
            ? challenges.damagePerMinute.toFixed(2)
            : undefined,
        minionsPerMinute: ((playerStats.totalMinionsKilled)/(matchData.info.gameDuration/60)).toFixed(1),
        minionsPerMinuteJg: ((playerStats.totalMinionsKilled + playerStats.neutralMinionsKilled)/(matchData.info.gameDuration/60)).toFixed(1),
        goldPerMinute: challenges.goldPerMinute !== undefined
            ? challenges.goldPerMinute.toFixed(2)
            : undefined,
        
        timeCCingOthers: playerStats.timeCCingOthers,
        visionScore: playerStats.visionScore,

        firstBloodKill: playerStats.firstBloodKill,
        firstBloodAssist: playerStats.firstBloodAssist,
        firstTowerKill: playerStats.firstTowerKill,
        firstTowerAssist: playerStats.firstTowerAssist,

        totalDamageShieldedOnTeammates: playerStats.totalDamageShieldedOnTeammates,
        totalHealsOnTeammates: playerStats.totalHealsOnTeammates, 
        totalDamageTaken: playerStats.totalDamageTaken,

        baronKills: playerStats.baronKills,
        dragonKills: playerStats.dragonKills,
        quadraKills: playerStats.quadraKills,
        pentaKills: playerStats.pentaKills,

        splashArt: splashArtUrl,
        iconChampion: iconChampionUrl,
        corDaBorda: defineCorDaBordaFrontal(playerStats.kills, playerStats.deaths, playerStats.assists),
        corDoVerso: defineCorVerso(playerStats.kills, playerStats.deaths, playerStats.assists),
        perks: {
            defense: getShardIcon(playerStats.perks.statPerks.defense),
            flex: getShardIcon(playerStats.perks.statPerks.flex),
            offense: getShardIcon(playerStats.perks.statPerks.offense),
            primaryStyle: getRuneIconUrl(playerStats.perks.styles[0].selections[0].perk),
            primaryStyleSec: getRuneIconUrl(playerStats.perks.styles[0].selections[1].perk),
            primaryStyleTert: getRuneIconUrl(playerStats.perks.styles[0].selections[2].perk),
            primaryStyleQuat: getRuneIconUrl(playerStats.perks.styles[0].selections[3].perk),
            subStyle: getRuneIconUrl(playerStats.perks.styles[1].selections[0].perk),
            subStyleSec: getRuneIconUrl(playerStats.perks.styles[1].selections[1].perk),
        },
        
        summonerSpells: {
            spell1: getSummonerSpellIcon(playerStats.summoner1Id),
            spell2: getSummonerSpellIcon(playerStats.summoner2Id),
        },

        items: {
            item0: getItemIcon(playerStats.item0),
            item1: getItemIcon(playerStats.item1),
            item2: getItemIcon(playerStats.item2),
            item3: getItemIcon(playerStats.item3),
            item4: getItemIcon(playerStats.item4),
            item5: getItemIcon(playerStats.item5),
            item6: getItemIcon(playerStats.item6),
        },

        augments: {
            augment1: getAugmentIconUrl(playerStats.playerAugment1),
            augment2: getAugmentIconUrl(playerStats.playerAugment2),
            augment3: getAugmentIconUrl(playerStats.playerAugment3),
            augment4: getAugmentIconUrl(playerStats.playerAugment4),
            augment5: getAugmentIconUrl(playerStats.playerAugment5),
            augment6: getAugmentIconUrl(playerStats.playerAugment6)
        },

        gameDate: new Date(matchData.info.gameStartTimestamp).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }),
    };
}

module.exports = createFilteredData;
