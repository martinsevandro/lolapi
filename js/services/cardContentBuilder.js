const commonSpanStyle = `
    font-family: Poppins;
    font-weight: 500;
    color: white;
    -webkit-text-stroke: 0.1px black;
    text-shadow: 0 0 9px black;
`;

function buildFirstLine(data, csLabel) {
    return `
        <div class="flex justify-between text-sm font-medium">
            <span style="${commonSpanStyle}" class="px-1 rounded">${data.kills}/${data.deaths}/${data.assists}</span>
            <span style="${commonSpanStyle}" class="px-1 rounded">${formatTime(data.gameLength)}</span>
            <span style="${commonSpanStyle}" class="px-1 rounded">${csLabel}</span>
        </div>
    `;
}

function buildSecondLine(data, thirdValue) {
    return `
        <div class="flex justify-between text-sm font-medium px-1 text-center"> 
            <span style="${commonSpanStyle}" class="rounded">${data.kda} KDA</span>
            <span style="${commonSpanStyle}" class="rounded">${data.killParticipation} KP%</span>
            <span style="${commonSpanStyle}" class="rounded">${thirdValue}</span>
        </div>
    `;
}

function buildThirdLine(cols) {
    return `
        <div class="flex w-full text-sm font-medium px-1">
            <span style="${commonSpanStyle}" class="w-1/3 text-left">${cols[0]}</span>
            <span style="${commonSpanStyle}" class="w-1/3 text-center">${cols[1]}</span>
            <span style="${commonSpanStyle}" class="w-1/3 text-right">${cols[2]}</span>
        </div>
    `;
}

function buildCardContent(data) {
    if (data.realRole === "sup") {
        return (
            buildFirstLine(data, `${data.totalMinionsKilled} CS`) +
            buildSecondLine(data, `${data.timeCCingOthers}s CC`) +
            buildThirdLine([
                `Damage <br> ${data.totalDamageDealtToChampions}`,
                `VisionScore <br>${data.visionScore}`,
                `GoldPM ${data.goldPerMinute}`,
            ])
        );
    } else if (data.realRole === "jungle") {
        return (
            buildFirstLine(data, `${data.totalMinionsKilledJg} CS`) +
            buildSecondLine(data, `${data.minionsPerMinuteJg} CSPM`) +
            buildThirdLine([
                `Damage <br> ${data.totalDamageDealtToChampions}`,
                `DamagePM ${data.damagePerMinute}`,
                `GoldPM ${data.goldPerMinute}`,
            ])
        );
    } else {
        return (
            buildFirstLine(data, `${data.totalMinionsKilled} CS`) +
            buildSecondLine(data, `${data.minionsPerMinute} CSPM`) +
            buildThirdLine([
                `Damage <br> ${data.totalDamageDealtToChampions}`,
                `DamagePM ${data.damagePerMinute}`,
                `GoldPM ${data.goldPerMinute}`,
            ])
        );
    }
}


function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
}

export { buildCardContent };
