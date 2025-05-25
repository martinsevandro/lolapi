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

// deploy no render
const path = require('path');

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// funções auxiliares de helpers
const {
    loadRunesData,
    loadAugmentsData,
    loadSpellsData,
    loadItemsData,
    getRuneIconUrl,
    getShardIcon,
    getSummonerSpellIcon, 
    getRegionalRoute,
    defineRole,
    definePlayerScore,
    defineSkinPosition,
    defineCorDaBorda,

} = require('./js/api/helpers.js');


// Função assíncrona para carregar dados e iniciar o servidor
async function startServer() {
    try {
        // Aguarda o carregamento completo dos dados antes de iniciar o servidor
        await loadAugmentsData(); 
        await loadRunesData();    
        await loadSpellsData();   
        await loadItemsData();    
        
        console.log('Dados carregados com sucesso.');
        
        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Erro ao carregar dados ou iniciar o servidor:', err);
    }
}

// Chama a função que carrega os dados e inicia o servidor
startServer();
 