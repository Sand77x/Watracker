#!/usr/bin/env node
import chalk from 'chalk';
import dayjs from 'dayjs';
import Conf from 'conf';
import minimist from 'minimist';

const config = new Conf({
    projectName: 'watracker',
    schema: {
        goal: { type: 'number', minimum: 5, maximum: 20, default: 8 },
        cap: { type: 'number', minimum: 8, maximum: 20, default: 10 },
        scale: { type: 'number', minimum: 1, maximum: 10, default: 4 },
        rows: { type: 'number', minimum: 1, maximum: 7, default: 4 },
        lastDrink: { type: 'string', default: 'never' },
        history: {
            type: "array", default:
                [{
                    cups: 0, when: (new Date()).toISOString()
                }],
            items: {
                type: "object",
                properties: {
                    cups: { type: 'number' },
                    when: {
                        type: 'string',
                    }
                }
            }
        }
    }
});

const rows = config.get('rows');
const dateFmt = ' MMM DD ';
const goal = config.get('goal');
const cap = config.get('cap');
const scale = config.get('scale');
const colors = [chalk.red, chalk.white, chalk.yellow, chalk.blue, chalk.green];
const breakpoint = Math.ceil(goal / 3);

function logWaterLevel(cups, label, showProgress) {
    const capped = Math.min(cap, cups);

    let s;

    if (capped < breakpoint) {
        s = colors[0];
    } else if (capped < breakpoint * 2) {
        s = colors[1];
    } else if (capped < goal) {
        s = colors[2];
    } else if (capped == goal) {
        s = colors[3];
    } else {
        s = colors[4];
    }

    const progressLabel = showProgress ? ` ${cups}/${goal} ` : '';
    const output = [
        s('╔══'), label, s('═'.repeat(cap * scale - label.length - progressLabel.length - 2)), s(progressLabel), s('══╗'), '\n',
        s('║ '), s('#'.repeat(capped * scale)), ' '.repeat((cap - capped) * scale), s(' ║'), '\n',
        s('╚══'), s('═'.repeat(cap * scale)), s('╝')
    ];

    console.log(output.join(''));
}

function isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

function syncHistory() {
    // add new day to config if not yet done
    let today = new Date();
    const history = config.get('history');

    if (!history[0] || !isSameDay(history[0].when, today.toISOString())) {
        config.set('history', [{ cups: 0, when: today.toISOString() }, ...history].slice(0, 10));
    }
}

function printMain() {
    const history = config.get('history'); // fetch history
    const today = new Date();

    const daysToPrint = {}
    for (let i = 0; i < rows; i++) {
        daysToPrint[i] = { cups: 0, when: today.toISOString() };
        today.setDate(today.getDate() - 1);
    }

    for (let day of history) {
        let offset = Math.abs(dayjs(day.when).diff(dayjs(), 'day'));
        if (offset < rows) {
            daysToPrint[offset].cups = day.cups;
        }
    }

    for (let i = rows - 1; i >= 1; i--) {
        logWaterLevel(daysToPrint[i].cups, dayjs(daysToPrint[i].when).format(dateFmt));
    }

    logWaterLevel(daysToPrint[0].cups, ' Today  ', true);
}

function printLastDrink() {
    let lastDrink = config.get('lastDrink');
    if (lastDrink === 'never') {
        console.log(chalk.white(`Last drink: never`))
    } else {
        const d = dayjs(lastDrink);
        if (d.diff(dayjs(), 'day') == 0) {
            console.log(chalk.white(`Last drink: ${d.format('HH:MM:ss')}`));
        } else {
            console.log(chalk.white(`Last drink: ${d.format('MMM DD')}`));
        }
    }
}

function printEncouragement() {
    const low = [
        "Time to hydrate, start with a cup!",
        "You’ve barely started, drink up!",
        "A little water goes a long way!"
    ];
    const medium = [
        "Good progress, keep it up!",
        "You’re halfway there, stay hydrated!",
        "Great job! A few more sips!"
    ];
    const almost = [
        "Almost there! Just one or two more!",
        "So close! Let’s hit that goal!",
        "You're almost at the finish line!"
    ];
    const _goal = [
        "Goal achieved! You’re doing great!",
        "You’ve reached your target, well done!",
        "Nice! You've hit your hydration goal!"
    ];
    const excellent = [
        "Excellent! You’re a hydration pro!",
        "Amazing! You're fully hydrated!",
        "Top-tier hydration, you're crushing it!"
    ];

    const currentCups = config.get('history')[0].cups;
    const capped = Math.min(cap, currentCups);

    let s;
    let color;
    let randomIdx = Math.floor(Math.random() * 3);

    if (capped < breakpoint) {
        s = low;
        color = colors[0];
    } else if (capped < breakpoint * 2) {
        s = medium;
        color = colors[1];
    } else if (capped < goal) {
        s = almost;
        color = colors[2];
    } else if (capped == goal) {
        s = _goal;
        color = colors[3];
    } else {
        s = excellent;
        color = colors[4];
    }

    console.log(color(s[randomIdx]));
}

function printStreak() {
    const history = config.get('history');
    let cnt = 0;
    for (let day of history) {
        if (day.cups >= config.get('goal')) {
            cnt++;
        } else { break; }
    }

    console.log(`Streak: ${cnt}`)
}

function main() {
    const args = minimist(process.argv.slice(2));
    const subcommand = args._[0];
    const setString = args._[1];

    syncHistory();

    if (subcommand === 'd' || subcommand === 'drink') {
        const history = config.get('history');
        history[0].cups = history[0].cups + 1;
        config.set('history', history);
        config.set('lastDrink', (new Date()).toISOString());
    } else if (subcommand === 'u' || subcommand === 'undrink') {
        const history = config.get('history');
        history[0].cups = Math.max(history[0].cups - 1, 0);
        config.set('history', history);
    } else if (subcommand === 's' || subcommand === 'set') {
        const [k, v] = setString.split("=");
        if (['goal', 'cap', 'rows', 'scale'].includes(k) && Number.isInteger(Number(v))) {
            try {
                config.set(k, Number(v));
            } catch (err) {
                console.log(`${err}`);
                return
            }

            console.log(`Config updated! (${k} = ${v})`);
        }

        return
    }

    printMain();
    printEncouragement();
    printLastDrink();
    printStreak();
}

main();
