import minimist from 'minimist';
import { syncHistory, printMain, printLastDrink, printStreak, printEncouragement } from './print.js';
import config from './config.js';

function main() {
    const history = syncHistory(config);

    const args = minimist(process.argv.slice(2));
    const subcommand = args._[0];
    const setString = args._[1];

    if (subcommand === 'd' || subcommand === 'drink') {
        history[0].cups = history[0].cups + 1;
        config.set('history', history);
        config.set('lastDrink', (new Date()).toISOString());
    } else if (subcommand === 'u' || subcommand === 'undrink') {
        history[0].cups = Math.max(history[0].cups - 1, 0);
        config.set('history', history);
    } else if (subcommand === 's' || subcommand === 'set') {
        const [k, v] = setString.split("=");
        if (['goal', 'max', 'rows', 'scale'].includes(k) && Number.isInteger(Number(v))) {
            try {
                config.set(k, Number(v));
            } catch (err) {
                console.log(`${err}`);
                return
            }

            console.log(`Config updated!`);
        }

        return
    }

    const cfg = config.store;

    printMain(cfg);
    printEncouragement(cfg);
    printLastDrink(cfg.lastDrink);
    printStreak(cfg);
}

main();
