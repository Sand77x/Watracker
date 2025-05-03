#!/usr/bin/env node

import minimist from 'minimist';
import { syncHistory, printMain, printLastDrink, printEncouragement, printStats, printNewLine } from './print.js';
import config from './config.js';
import helpMsg from './help.js';

function main() {
    const history = syncHistory(config);

    const args = minimist(process.argv.slice(2));
    const subcommand = args._[0];
    const setString = args._[1];

    const today = history[0];

    if (subcommand === 'd' || subcommand === 'drink') {
        today.cups = today.cups + 1;

        if (today.cups == config.get('goal')) {
            config.set('streak', config.get('streak') + 1);
        }

        config.set('history', history);
        config.set('lastDrink', (new Date()).toISOString());
    } else if (subcommand === 'u' || subcommand === 'undrink') {
        today.cups = Math.max(today.cups - 1, 0);

        if (today.cups == config.get('goal') - 1) {
            config.set('streak', config.get('streak') - 1);
        }

        config.set('history', history);
    } else if (subcommand === 's' || subcommand === 'set') {
        const [k, v] = setString.split("=");
        if (['goal', 'max', 'rows', 'scale'].includes(k) && Number.isInteger(Number(v))) {
            if ((k === 'goal' && v > config.get('max')) || (k === 'max' && v < config.get('goal'))) {
                console.log(`Goal must be less than max.`);
                return;
            }

            try {
                config.set(k, Number(v));
            } catch (err) {
                console.log(`${err}`);
                return;
            }

            console.log(`Config updated!`);
        }

        return;
    } else if (subcommand === 'h' || subcommand === 'help') {
        console.log(helpMsg);
        return;
    }

    const cfg = config.store;

    printMain(cfg);
    printEncouragement(cfg);
    printNewLine();
    printLastDrink(cfg.lastDrink);
    printStats(cfg);
}

main();
