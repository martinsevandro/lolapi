export function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function sanitizeImageTag(html) {
    if (typeof html !== 'string' || !html.includes('src=')) return '';
    
    const div = document.createElement('div');
    div.innerHTML = html;

    const img = div.querySelector('img');
    if (!img) return '';

    // Verifica se o src é uma URL HTTPS válida
    try {
        const url = new URL(img.src);
        if (url.protocol !== 'https:') return '';
    } catch (e) {
        return '';
    }

    // Remove atributos potencialmente perigosos
    img.removeAttribute('onerror');
    img.removeAttribute('onclick');
    img.removeAttribute('onload');
    img.removeAttribute('style'); // opcional, se quiser mais controle

    return img.outerHTML;
}

export function getSafeImageSrc(url) {
    if (typeof url !== 'string') return '';
    try {
        const parsed = new URL(url, window.location.href);
        if (parsed.protocol !== 'https:' && !parsed.href.startsWith(window.location.origin)) return '';
        return parsed.href;
    } catch {
        return '';
    }
}


const commonSpanStyle = `
    font-family: Poppins;
    font-weight: 500;
    color: white;
    -webkit-text-stroke: 0.1px black;
    text-shadow: 0 0 9px black;
`;

function buildFirstLine(data, csLabel) {
    return `
        <div class="flex justify-between items-end text-sm font-medium">
            <span style="${commonSpanStyle}" class="px-1 rounded">
                ${escapeHTML(`${data.kills}/${data.deaths}/${data.assists}`)}
            </span>
            <span style="${commonSpanStyle}" class="px-1 rounded">
                ${escapeHTML(`${formatTime(data.gameLength)}`)}
            </span>
            <span style="${commonSpanStyle}" class="px-1 rounded">
                ${csLabel}
            </span>
        </div>
    `;
}

function buildSecondLine(data, thirdValue) {
    return `
        <div class="flex justify-between text-sm font-medium px-1 text-center"> 
            <span style="${commonSpanStyle}" class="rounded">
                ${escapeHTML(data.kda)} KDA
            </span>
            <span style="${commonSpanStyle}" class="rounded">
                ${escapeHTML(data.killParticipation)} KP%
            </span>
            <span style="${commonSpanStyle}" class="rounded">
                ${escapeHTML(thirdValue)}
            </span>
        </div>
    `;
}

function buildThirdLine(cols) {
    return `
        <div class="flex w-full text-sm font-medium px-1">
            <span style="${commonSpanStyle}" class="w-1/3 text-left">
                ${cols[0]}
            </span>
            <span style="${commonSpanStyle}" class="w-1/3 text-center">
                ${cols[1]}
            </span>
            <span style="${commonSpanStyle}" class="w-1/3 text-right">
                ${cols[2]}
            </span>
        </div>
    `;
}

export function buildCardContent(data) {
    // modo arena
    if (data.gameMode === "CHERRY") {
        return (
            buildFirstLine(data, sanitizeImageTag(`<img src="${data.iconChampion}" class="w-12 h-12" alt="duoChampion">`)) +
            buildSecondLine(data, `${data.timeCCingOthers}s CC`) +
            buildThirdLine([
                `Damage <br> ${escapeHTML(data.totalDamageDealtToChampions.toString())}`,
                `DamagePM ${escapeHTML(data.damagePerMinute.toString())}`,
                `GoldPM ${escapeHTML(data.goldPerMinute.toString())}`,
            ])
        );
    }

    if (data.realRole === "sup") {
        return (
            buildFirstLine(data, `${data.totalMinionsKilled} CS`) +
            buildSecondLine(data, `${data.timeCCingOthers}s CC`) +
            buildThirdLine([
                `Damage <br> ${escapeHTML(data.totalDamageDealtToChampions.toString())}`,
                `VisionScore <br>${escapeHTML(data.visionScore.toString())}`,
                `GoldPM ${escapeHTML(data.goldPerMinute.toString())}`,
            ])
        );
    } else if (data.realRole === "jungle") {
        return (
            buildFirstLine(data, `${data.totalMinionsKilledJg} CS`) +
            buildSecondLine(data, `${data.minionsPerMinuteJg} CSPM`) +
            buildThirdLine([
                `Damage <br> ${escapeHTML(data.totalDamageDealtToChampions.toString())}`,
                `DamagePM ${escapeHTML(data.damagePerMinute.toString())}`,
                `GoldPM ${escapeHTML(data.goldPerMinute.toString())}`,
            ])
        );
    } else {
        return (
            buildFirstLine(data, `${data.totalMinionsKilled} CS`) +
            buildSecondLine(data, `${data.minionsPerMinute} CSPM`) +
            buildThirdLine([
                `Damage <br> ${escapeHTML(data.totalDamageDealtToChampions.toString())}`,
                `DamagePM ${escapeHTML(data.damagePerMinute.toString())}`, 
                `GoldPM ${escapeHTML(data.goldPerMinute.toString())}`,
            ])
        );
    }
}

export function runasCardContent(data) {
    if (data.gameMode === "CHERRY"){
        return `
            <!-- Augments -->
            <div class="flex flex-wrap gap-1">
                ${Object.values(data.augments)
                    .filter(url => url) // remove null/undefined
                    .map(url => sanitizeImageTag(`<img src="${url}" class="w-6 h-6 bg-black rounded" alt="augment">`))
                    .join('')}
            </div>
        `;

    } else {
        return  `
            <!-- Runas -->
            <div class="flex flex-wrap gap-1"> 
                ${sanitizeImageTag(`<img src="${data.perks.primaryStyle}" class="w-6 h-6" alt="runap0">`)}
                ${sanitizeImageTag(`<img src="${data.perks.primaryStyleSec}" class="w-6 h-6" alt="runap1">`)}
                ${sanitizeImageTag(`<img src="${data.perks.primaryStyleTert}" class="w-6 h-6" alt="runap2">`)}
                ${sanitizeImageTag(`<img src="${data.perks.primaryStyleQuat}" class="w-6 h-6" alt="runap3">`)}
                ${sanitizeImageTag(`<img src="${data.perks.subStyle}" class="w-6 h-6" alt="runas0">`)}
                ${sanitizeImageTag(`<img src="${data.perks.subStyleSec}" class="w-6 h-6" alt="runas1">`)}
            </div>

            <!-- StatPerks -->
            <div class="flex gap-1 ml-2">
                ${sanitizeImageTag(`<img src="${data.perks.offense}" class="w-6 h-6" alt="offense-perk">`)}
                ${sanitizeImageTag(`<img src="${data.perks.flex}" class="w-6 h-6" alt="flex-perk">`)}
                ${sanitizeImageTag(`<img src="${data.perks.defense}" class="w-6 h-6" alt="defense-perk">`)}
            </div>
         `;
    }

}

export function itemsCardContent(data) {
    return `
        <!-- Itens --> 
        <div class="flex flex-wrap gap-1">
            ${Object.values(data.items)
                    .filter(url => url) // remove null/undefined
                    .map(url => sanitizeImageTag(`<img src="${url}" class="w-6 h-6 bg-black rounded" alt="item ${url}">`))
                    .join('')}
        </div>
    `;      
}

export function spellsCardContent(data) {
    return `
        <!-- Spells (flash, ignite, ...) -->
        <div class="flex gap-1 ml-2">
            ${sanitizeImageTag(`<img src="${data.summonerSpells.spell1}" class="w-6 h-6" alt="spell1">`)}
            ${sanitizeImageTag(`<img src="${data.summonerSpells.spell2}" class="w-6 h-6" alt="spell2">`)}
        </div>

    `;
}

export function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
}

// export { buildCardContent, runasCardContent, itemsCardContent };
