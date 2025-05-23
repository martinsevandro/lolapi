import { buildCardContent, runasCardContent, itemsCardContent, spellsCardContent, escapeHTML, getSafeImageSrc } from './services/cardContentBuilder.js';  // Importando a função

document.getElementById('search-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('riot-name').value.trim();
    const tag = document.getElementById('riot-tag').value.trim();
    const server = document.getElementById('riot-server').value.trim();
    const matchID = document.getElementById('match-id').value.trim();

    const cardError = { 
        riotIdGameName: "Maintenance", 
        splashArt: "../assets/img/wantedAPI.png",
        corDaBorda: "linear-gradient(45deg, #633B1B, #965F32, #BB8947, #A0652E)", 
        gameDate: new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }),
        
    };

    if (!name || !tag || !server ) return alert('Preencha nome, tag e servidor');

    try {
        // const baseUrl = 'http://localhost:3001'; // URL base da sua API
        // console.log(`Buscando PUUID para: ${name} ${tag} ${server}`); 

        // 1. Buscar PUUID
        const puuidRes = await axios.get(`http://localhost:3001/api/player/${name}/${tag}/${server}`);
        const puuidData = puuidRes.data;
        
        // Partida de acordo com o matchID
        let matchUrl;
        if (matchID) {
            // Se o usuário forneceu um matchId específico
            matchUrl = `http://localhost:3001/api/matches/lol/last/${puuidData.puuid}/${server}/${matchID}`;
        } else {
            // Se o campo estiver vazio, buscar a última partida automaticamente
            matchUrl = `http://localhost:3001/api/matches/lol/last/${puuidData.puuid}/${server}`;
        }
        
        // Buscar partida com base no matchID
        let matchRes;
        
        try {
            matchRes = await axios.get(matchUrl);
        } catch (error) { 
            if (error.response && error.response.status === 403) {
                renderErrorCard(cardError);
                return;
            } else {
                const errorMsg = error.response?.data?.error || 'Erro ao buscar a partida';
                throw new Error(errorMsg);
            }
        }
        // console.log('Dados da partida (matchRes):', matchRes); // Verifique a resposta da partida
        
        const matchData = matchRes.data;
        
        // console.log('Dados da partida (matchData):', matchData); // Verifique os dados da partida

        // 3. Renderizar no card
        renderCard(matchData);
    } catch (err) {
        console.error('Erro geral:', err);
    
        if (err.message.includes('403') || err.message.includes('Forbidden')) {
            renderErrorCard(cardError);
        } else {
            alert('Erro ao buscar dados. Verifique os campos e tente novamente.'); 
        }
    }
});

function renderCard(data) {
    const container = document.getElementById('card-container');
    container.innerHTML = ''; // Limpar o container

    const card = document.createElement('div');
    card.classList.add('player-card', 'flip-card', 'w-[308px]', 'h-[560px]', 'perspective');

    const cardContent = buildCardContent(data);  // funcao para status base da carta

    const runaContent = runasCardContent(data); // funcao para status de spells da carta

    const itemContent = itemsCardContent(data);

    const spellContent = spellsCardContent(data); 

    // Adiciona os icones de achievements no card se conseguir alguns status
    let achievements = [];

    if (data.gameMode === "CLASSIC" && data.jungleKing === true && data.deaths === 0 && data.killParticipation >= 60.0) {
        achievements.push(`<img src="../assets/achievements/challenge-finalBoss.png" class="w-6 h-6" alt="achievement-finalBoss" title="The Final Boss">`);
    }
    if (data.deaths === 0 && (data.gameMode === "CHERRY" || data.killParticipation >= 60.0)) {
        achievements.push(`<img src="../assets/achievements/challenge-perfectMatch.png" class="w-6 h-6" alt="achievement-perfectMatch" title="This is Perfect">`);
    }
    if (data.gameMode === "CLASSIC" && data.jungleKing === true && data.killParticipation >= 40.0) {
        achievements.push(`<img src="../assets/achievements/challenge-jungleKing.png" class="w-6 h-6" alt="achievement-jungleKing" title="The Jungle King">`);        
    }
    if (data.damagePerMinute >= 1000 && (data.gameMode === "CHERRY" || data.killParticipation >= 40.0)) {
        achievements.push(`<img src="../assets/achievements/challenge-damageDealt.png" class="w-6 h-6" alt="achievement-damageDealt" title="The Damage Master">`);
    }
    if (data.totalDamageTaken >= 10000 && (data.gameMode === "CHERRY" || data.killParticipation >= 40.0)) {
        achievements.push(`<img src="../assets/achievements/challenge-damageTaken.png" class="w-6 h-6" alt="achievement-damageTaken" title="The Tank">`);
    }
    if (data.totalDamageShieldedOnTeammates >= 5000 && (data.gameMode === "CHERRY" || data.killParticipation >= 40.0)) {
        achievements.push(`<img src="../assets/achievements/challenge-shieldOnTeammates.png" class="w-6 h-6" alt="achievement-shielOnTeammates" title="The Protect">`);
    }
    if (data.visionScore >= 80 && data.killParticipation >= 40.0) {
        achievements.push(`<img src="../assets/achievements/challenge-visionScore.png" class="w-6 h-6" alt="achievement-visionScore" title="Super Vision!">`);
    }
    if (data.pentaKills > 0) {
        achievements.push(`<img src="../assets/achievements/challenge-pentaKill.png" class="w-6 h-6" alt="achievement-pentaKill" title="Penta Kill!">`);
    }
    if (data.totalHealsOnTeammates >= 5000 && (data.gameMode === "CHERRY" || data.killParticipation >= 40.0)) {
        achievements.push(`<img src="../assets/achievements/challenge-healer.png" class="w-6 h-6" alt="achievement-HealsOnTeammates" title="The Ambulance">`);
    } 

    card.innerHTML = `
        <div class="carta flip-card w-[308px] h-[560px] relative">
        
            <div class="flip-inner relative w-full h-full">

                <!-- Frente do card -->
                <div class="flip-front relative w-full h-full rounded-none overflow-hidden shadow-lg border-4" 
                    style="border: 4px solid transparent; border-image: ${data.corDaBorda} 1;">                    
                
                    <!-- Splash da skin de fundo -->                    
                    <img src="${getSafeImageSrc(data.splashArt)}" 
                    class="absolute w-full h-full object-cover" 
                    alt="card-champion" />
                    
                    <!-- Conteúdo que ficará sobre o card -->
                    <div class="absolute bottom-0 w-full text-white p-4 space-y-2">
                        
                        <!-- Nome e Tag -->
                        <div class="flex justify-center">
                            <h2 class="text-center text-blur" style="
                                font-family: 'Herr Von Muellerhoff', cursive;
                                color: white; 
                                -webkit-text-stroke: 0.5px gold; 
                                text-shadow: 0 0 9px black;
                                font-size: clamp(2.5rem, 5vw, 3.4rem);">
                                ${escapeHTML(data.riotIdGameName)}
                            </h2>                            
                        </div>
                            
                        <!-- Estatisticas gerais - Primeira, Segunda e Terceira linhas -->
                        ${cardContent}
                        
                        <!-- Runas e StatPerks - Quarta linha -->
                        <div class="flex justify-between items-center mt-2">
                            ${runaContent}
                        </div>

                        <!-- Itens e Spells - Quinta linha -->
                        <div class="flex justify-between items-center mt-2">
                            <!-- Itens -->
                            ${itemContent}

                            <!-- Spells -->
                            ${spellContent}                    
                            
                        </div>

                        <!-- Data da partida -->
                        <div class="flex justify-between items-center mt-2">
                            <!-- Achievements -->
                            <div class="flex items-center">
                                ${achievements.join("")}    
                            </div>
                                    
                            <div class="mt-2 flex">                    
                                <p style="font-family: Poppins; font-weight: 500; color: white; -webkit-text-stroke: 0.1px black; text-shadow: 0 0 9px black;" 
                                    class="text-sm inline-flex px-2 py-1 rounded">
                                    ${escapeHTML(data.gameDate)}</p>                    
                            </div>
                        </div>   

                    </div>
                </div>

                <!-- Verso do card -->  
                <div class="flip-back rounded-none overflow-hidden shadow-lg border-4" 
                    style="border: 4px solid transparent; border-image: ${data.corDaBorda} 1; background: ${data.corDaBorda}; ">
                        
                    <div class="items flex justify-center items-center h-full" 
                        style="background-image: url('../assets/img/lol-icone-back.png'); background-size: 70%; background-repeat: no-repeat; background-position: center;">
                    </div>

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
        reverse: true,
    });

}

function renderErrorCard(errorData) {
    const container = document.getElementById('card-container');
    container.innerHTML = ''; // Limpar o container

    const card = document.createElement('div');
    card.classList.add('player-card', 'flip-card', 'w-[308px]', 'h-[560px]', 'perspective');

    card.innerHTML = ` 
        <div class="carta flip-card w-[308px] h-[560px] relative">
        
            <div class="flip-inner relative w-full h-full">

                <!-- Frente do card -->
                <div class="flip-front relativo w-full h-full rounded-none overflow-hidden shadow-lg border-4" 
                    style="border: 4px solid transparent; border-image: ${errorData.corDaBorda} 1;">

                    <!-- Splash da skin de fundo -->
                    <img src="${errorData.splashArt}"
                    class="absolute w-full h-full object-cover"
                    alt="card-ApiError" />

                    <!-- Conteúdo que ficará sobre o card -->
                    <div class="absolute bottom-0 w-full text-white p-4 space-y-2"> 
                    
                        <!-- Nome e Tag -->
                        <div class="flex justify-center">
                            <h2 class="text-sm inline-flex px-2 py-1 rounded mb-8" style="
                                font-family: Poppins; font-weight: 500; color: black; -webkit-text-stroke: 0.1px black; text-shadow: 0 0 9px black;">
                                ${escapeHTML(errorData.gameDate)}
                                 
                            </h2>
                        </div>
                         
                    </div>
                </div>

                <!-- Verso do card -->
                <div class="flip-back rounded-none overflow-hidden shadow-lg border-4" 
                    style="border: 4px solid transparent; border-image: ${errorData.corDaBorda} 1; background: ${errorData.corDaBorda}; ">
                        
                    <div class="items flex justify-center items-center h-full"
                        style="background-image: url('../assets/img/lol-icone-back.png'); background-size: 70%; background-repeat: no-repeat; background-position: center;">
                    </div>
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
        reverse: true,
    });

                    
}
