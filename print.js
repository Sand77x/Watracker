import dayjs from 'dayjs';
import messages from './encouragement.js';
import { red, white, yellow, green, cyan } from 'yoctocolors';
import { getDaysApart, TODAY } from './utils.js'

const colors = [red, white, yellow, cyan, green];

function logWaterLevel(cfg, cups, dateLabel, showProgress) {
    const cappedCups = Math.min(cfg.max, cups);
    const breakpoint = Math.ceil(cfg.goal / 3);
    let color;

    if (cappedCups < breakpoint) {
        color = colors[0];
    } else if (cappedCups < breakpoint * 2) {
        color = colors[1];
    } else if (cappedCups < cfg.goal) {
        color = colors[2];
    } else if (cappedCups == cfg.goal) {
        color = colors[3];
    } else {
        color = colors[4];
    }

    const progressLabel = showProgress ? ` ${cups}/${cfg.goal} ` : '';
    const output = [
        color('╔══'), dateLabel, color('═'.repeat(cfg.max * cfg.scale - dateLabel.length - progressLabel.length - 2)), color(progressLabel), color('══╗'), '\n',
        color('║ '), color('#'.repeat(cappedCups * cfg.scale)), ' '.repeat((cfg.max - cappedCups) * cfg.scale), color(' ║'), '\n',
        color('╚══'), color('═'.repeat(cfg.max * cfg.scale)), color('╝')
    ];

    console.log(output.join(''));
}

export function syncHistory(config) {
    // add new day to config if not yet done
    const history = config.get('history');
    if (!history[0] || getDaysApart(history[0].date, TODAY) != 0) {
        const newEntry = {
            cups: 0,
            date: TODAY.toISOString()
        };
        config.set('history', [newEntry, ...history].slice(0, 10));
    }

    return config.get('history');
}

export function printMain(cfg) {
    let datePointer = TODAY;
    const dateFmt = ' MMM DD ';

    const levelsToPrint = {}
    for (let i = 0; i < cfg.rows; i++) {
        levelsToPrint[i] = { cups: 0, date: dayjs(datePointer) };
        datePointer = datePointer.subtract(1, 'day');
    }

    for (let record of cfg.history) {
        const offset = getDaysApart(record.date, TODAY);
        levelsToPrint[offset].cups = record.cups;
    }

    for (let i = cfg.rows - 1; i >= 1; i--) {
        const dateLabel = levelsToPrint[i].date.format(dateFmt);
        logWaterLevel(cfg, levelsToPrint[i].cups, dateLabel, true);
    }

    logWaterLevel(cfg, levelsToPrint[0].cups, ' Today  ', true);
}

export function printLastDrink(lastDrink) {
    if (lastDrink === 'never') {
        console.log(white(`Last drink: never`))
    } else {
        const d = dayjs(lastDrink)
        if (getDaysApart(d, TODAY) == 0) {
            console.log(white(`Last drink: ${d.format('h:mm:ss A')}`));
        } else {
            console.log(white(`Last drink: ${d.format('MMM DD')}`));
        }
    }
}

export function printEncouragement(cfg) {
    const cups = cfg.history[0].cups;
    const breakpoint = Math.ceil(cfg.goal / 3);

    let s, color;

    if (cups < breakpoint) {
        s = messages.low;
        color = colors[0];
    } else if (cups < breakpoint * 2) {
        s = messages.medium;
        color = colors[1];
    } else if (cups < cfg.goal) {
        s = messages.almost;
        color = colors[2];
    } else if (cups == cfg.goal) {
        s = messages.goal;
        color = colors[3];
    } else {
        s = messages.high;
        color = colors[4];
    }

    let randomIdx = Math.floor(Math.random() * s.length);
    console.log(color(s[randomIdx]));
}

export function printStats(cfg) {
    let sum = 0;
    let streak = 0;
    let streakOver = false;
    for (let record of cfg.history) {
        if (getDaysApart(TODAY, record.when) < 7) {
            sum += record.cups;
        }

        if (!streakOver && record.cups >= cfg.goal) {
            streak++;
        } else {
            streakOver = true;
        }
    }

    const avg = (sum / 7).toFixed(2);
    const streakText = cyan(`🌊 ${streak} day streak!`);

    console.log(`Avg Cups/day: ${avg}`);

    if (streak > 0) {
        console.log(streakText)
    }
}

export function printNewLine() {
    console.log('');
}
