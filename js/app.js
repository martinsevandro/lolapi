document.getElementById('search-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('riot-name').value.trim();
    const tag = document.getElementById('riot-tag').value.trim();
    const server = document.getElementById('riot-server').value.trim();

    if (!name || !tag) return alert('Preencha os dois campos!');

    try {
        console.log(`Buscando PUUID para: ${name} ${tag} ${server}`);  // Adicione este log

        // 1. Buscar PUUID
        const puuidRes = await fetch(`http://localhost:3001/api/player/${name}/${tag}/${server}`);
        console.log('Status da resposta de PUUID:', puuidRes.status);  // Logando status da resposta

        if (!puuidRes.ok) {
            throw new Error('Erro ao buscar PUUID');
        }

        const puuidData = await puuidRes.json();
        console.log('Resposta da API de Conta:', puuidData); // Logando dados do PUUID

        // 2. Buscar última partida
        const matchRes = await fetch(`http://localhost:3001/api/matches/lol/last/${puuidData.puuid}/${server}`);
        console.log('Status da resposta da última partida:', matchRes.status); // Logando status da resposta

        if (!matchRes.ok) {
            throw new Error('Erro ao buscar última partida');
        }

        const matchData = await matchRes.json();
        console.log('Dados da última partida:', matchData); // Verifique os dados da última partida

        // 3. Renderizar no card
        renderCard(matchData);
    } catch (err) {
        console.error('Erro geral:', err);
        alert('Erro ao buscar dados. Verifique o nome e tag ou tente novamente.');
    }
});

function renderCard(data) {
    const container = document.getElementById('card-container');
    container.innerHTML = ''; // Limpar o container

    const card = document.createElement('div');
    card.classList.add('player-card', 'flip-card', 'w-[308px]', 'h-[560px]', 'perspective');

    let cardContent = "";

    if (data.realRole === "sup") {
        cardContent = `
            <!-- Estatisticas gerais - Primeira linha -->
            <div class="flex justify-between text-sm text-gray-200 font-medium">
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class=" px-1 rounded">${data.kills}/${data.deaths}/${data.assists}</span>
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class=" px-1 rounded">${formatTime(data.gameLength)}</span>
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class=" px-1 rounded">${data.totalMinionsKilled} CS</span>
            </div>
            <!-- Estatisticas gerais - Segunda linha -->
            <div class="flex justify-between text-sm text-gray-200 font-medium px-1 text-center"> 
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="  rounded">${data.kda} KDA</span>
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="  rounded">${data.killParticipation} KP%</span>
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="  rounded">${data.timeCCingOthers}s CC</span>
            </div>

            <!-- Estatisticas gerais - Terceira linha -->
            <div class="flex w-full text-sm text-gray-200 font-medium px-1">
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="w-1/3 text-left">Damage <br> ${data.totalDamageDealtToChampions}</span>
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="w-1/3 text-center">VisionScore <br>${data.visionScore}</span>
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="w-1/3 text-right">Gold/min ${data.goldPerMinute}</span>
            </div>
        `;
    } else if (data.realRole === "jungle") {
        cardContent = `
            <!-- Estatisticas gerais - Primeira linha -->
            <div class="flex justify-between text-sm text-gray-200 font-medium">
                    <span style="color=white; -webkit-text-stroke: 0.1px silver;" class=" px-1 rounded">${data.kills}/${data.deaths}/${data.assists}</span>
                    <span style="color=white; -webkit-text-stroke: 0.1px silver;" class=" px-1 rounded">${formatTime(data.gameLength)}</span>
                    <span style="color=white; -webkit-text-stroke: 0.1px silver;" class=" px-1 rounded">${data.totalMinionsKilledJg} CS</span>
            </div>
            <!-- Estatisticas gerais - Segunda linha -->
            <div class="flex justify-between text-sm text-gray-200 font-medium px-1 text-center"> 
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="  rounded">${data.kda} KDA</span>
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="  rounded">${data.killParticipation} KP%</span>
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="  rounded">${data.minionsPerMinuteJg} CS/min</span>
            </div>

            <!-- Estatisticas gerais - Terceira linha -->
            <div class="flex w-full text-sm text-gray-200 font-medium px-1">
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="w-1/3 text-left">Damage <br> ${data.totalDamageDealtToChampions}</span>
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="w-1/3 text-center">Damage/min ${data.damagePerMinute}</span>
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="w-1/3 text-right">Gold/min ${data.goldPerMinute}</span>
            </div>
        `;

    } else {
        cardContent = `
            <!-- Estatisticas gerais - Primeira linha -->
            <div class="flex justify-between text-sm text-gray-200 font-medium">
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class=" px-1 rounded">${data.kills}/${data.deaths}/${data.assists}</span>
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class=" px-1 rounded">${formatTime(data.gameLength)}</span>
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class=" px-1 rounded">${data.totalMinionsKilled} CS</span>
            </div>
            <!-- Estatisticas gerais - Segunda linha -->
            <div class="flex justify-between text-sm text-gray-200 font-medium px-1 text-center"> 
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="  rounded">${data.kda} KDA</span>
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="  rounded">${data.killParticipation} KP%</span>
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="  rounded">${data.minionsPerMinute} CS/min</span>
            </div>

            <!-- Estatisticas gerais - Terceira linha -->
            <div class="flex w-full text-sm text-gray-200 font-medium px-1">
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="w-1/3 text-left">Damage <br> ${data.totalDamageDealtToChampions}</span>
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="w-1/3 text-center">Damage/min ${data.damagePerMinute}</span>
                <span style="color=white; -webkit-text-stroke: 0.1px silver;" class="w-1/3 text-right">Gold/min ${data.goldPerMinute}</span>
            </div>
        `;
    }

    let achievements = [];

    if (data.gameMode === "CLASSIC" & data.jungleKing === true & data.deaths === 0 & data.killParticipation >= 60.0) {
        achievements.push(`<img src="../assets/achievements/challenge-finalBoss.png" class="w-6 h-6" alt="achievement-finalBoss">`);
    }
    if (data.deaths === 0 & data.killParticipation >= 30.0) {
        achievements.push(`<img src="../assets/achievements/challenge-perfectMatch.png" class="w-6 h-6" alt="achievement-perfectMatch">`);
    }
    if (data.gameMode === "CLASSIC" & data.jungleKing === true & data.killParticipation >= 30.0) {
        achievements.push(`<img src="../assets/achievements/challenge-jungleKing.png" class="w-6 h-6" alt="achievement-jungleKing">`);
        console.log("matchDragons é =", data.matchDragons);
    }
    if ((data.totalDamageDealtToChampions >= 10000 || data.damagePerMinute >= 1000) & data.killParticipation >= 30.0) {
        achievements.push(`<img src="../assets/achievements/challenge-damageDealt.png" class="w-6 h-6" alt="achievement-damageDealt">`);
    }
    if (data.totalDamageTaken >= 10000 & data.killParticipation >= 30.0) {
        achievements.push(`<img src="../assets/achievements/challenge-damageTaken.png" class="w-6 h-6" alt="achievement-damageTaken">`);
    }
    if (data.totalDamageShieldedOnTeammates >= 7000 & data.killParticipation >= 30.0) {
        achievements.push(`<img src="../assets/achievements/challenge-shieldOnTeammates.png" class="w-6 h-6" alt="achievement-shielOnTeammates">`);
    }
    if (data.visionScore >= 50 & data.killParticipation >= 30.0) {
        achievements.push(`<img src="../assets/achievements/challenge-visionScore.png" class="w-6 h-6" alt="achievement-visionScore">`);
    }
    if (data.pentaKills > 0) {
        achievements.push(`<img src="../assets/achievements/challenge-pentaKill.png" class="w-6 h-6" alt="achievement-pentaKill">`);
    }
    if (data.totalHealsOnTeammates >= 10000 & data.killParticipation >= 30.0) {
        achievements.push(`<img src="../assets/achievements/challenge-healer.png" class="w-6 h-6" alt="achievement-HealsOnTeammates">`);
    }

    card.innerHTML = `
        <div class="carta flip-card w-[308px] h-[560px] relative">
        
            <div class="flip-inner relative w-full h-full">

                <!-- Frente do card -->
                <div class="flip-front relative w-full h-full rounded-none overflow-hidden shadow-lg border-4 " style="border-color: ${data.corDaBorda};">
                
                    <!-- Splash da skin de fundo -->
                    <img src="${data.splashArt}" 
                    class="absolute w-full h-full object-cover" 
                    alt="card-champion" />
                    
                    <!-- Conteúdo que ficará sobre o card -->
                    <div class="absolute bottom-0 w-full text-white p-4 space-y-2">

                        <!-- Nome e Tag -->
                        <div class="flex justify-center">
                            <div class=" p-2 rounded-md text-center">
                                <h2 class="text-blur text-6xl" style="
                                font-family: 'Herr Von Muellerhoff', cursive;
                                color: white;  -webkit-text-stroke: 0.5px gold;">
                                ${data.riotIdGameName}</h2>
                            </div>
                        </div>
                            
                        <!-- Estatisticas gerais - Primeira, Segunda e Terceira linhas -->
                        ${cardContent}
                        


                        <!-- Runas e StatPerks - Quarta linha -->
                        <div class="flex justify-between items-center mt-2">
                            <!-- Runas -->
                            <div class="flex flex-wrap gap-1">
                                <img src="${data.perks.primaryStyle}" class="w-6 h-6" alt="runap0">
                                <img src="${data.perks.primaryStyleSec}" class="w-6 h-6" alt="runap1">
                                <img src="${data.perks.primaryStyleTert}" class="w-6 h-6" alt="runap2">
                                <img src="${data.perks.primaryStyleQuat}" class="w-6 h-6" alt="runap3">
                                <img src="${data.perks.subStyle}" class="w-6 h-6" alt="runas0">
                                <img src="${data.perks.subStyleSec}" class="w-6 h-6" alt="runas1">
                            </div>

                            <!-- StatPerks -->
                            <div class="flex gap-1 ml-2">
                                <img src="${data.perks.offense}" class="w-6 h-6" alt="offense-perk">
                                <img src="${data.perks.flex}" class="w-6 h-6" alt="flex-perk">
                                <img src="${data.perks.defense}" class="w-6 h-6" alt="defense-perk">
                            </div>
                        </div>

                        <!-- Itens e Spells - Quinta linha -->
                        <div class="flex justify-between items-center mt-2">
                            <!-- Itens -->
                            <div class="flex flex-wrap gap-1">
                                ${data.items
                                .filter(id => id !== 0) // filtra itens "vazios"
                                .map(id => `<img src="https://ddragon.leagueoflegends.com/cdn/15.8.1/img/item/${id}.png" class="w-6 h-6" alt="item ${id}">`)
                                .join('')}
                            </div>

                            <!-- Spells -->
                            <div class="flex gap-1 ml-2">
                                <img src="${data.summonerSpells.spell1}" class="w-6 h-6 bg-black/25 backdrop-blur-sm" alt="spell1">
                                <img src="${data.summonerSpells.spell2}" class="w-6 h-6 bg-black/25 backdrop-blur-sm" alt="spell2">
                            </div>                    
                            
                        </div>


                        <!-- Data da partida -->
                        <div class="flex justify-between items-center mt-2">
                            <!-- Achievements -->
                            <div class="flex items-center">
                                ${achievements.join("")}    
                            </div>
                                    
                            <div class="mt-2 flex">                    
                                <p style="color=white; -webkit-text-stroke: 0.1px silver;" class="text-sm text-gray-200 inline-flex px-2 py-1 rounded">${data.gameDate}</p>                    
                            </div>
                        </div>   

                    </div>
                </div>

                <!-- Verso do card -->  
                <!-- <div class="flip-front relative w-full h-full rounded-none overflow-hidden shadow-lg border-4 " style="border-color: ${data.corDaBorda};"> -->              
                <div class="flip-back rounded-none overflow-hidden shadow-lg"
                style="background-image: url('../assets/img/back-yugioh.jpg'); border-color: ${data.corDaBorda};">
                     
                </div>

            </div>
        </div>
    `;

    // Adiciona o evento de clique para virarq
    card.addEventListener("click", () => {
        const inner = card.querySelector(".flip-inner");
        inner.classList.toggle("rotate-y-180");
    });

    container.appendChild(card);

    VanillaTilt.init(card.querySelectorAll(".carta"), {
        max: 2,
        speed: 100,
        glare: false,
        reverse: true,
        // "max-glare": 0.1,
    });

}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
}
