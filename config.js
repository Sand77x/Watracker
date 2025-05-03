import Conf from 'conf';

export default new Conf({
    projectName: 'watracker',
    schema: {
        goal: { type: 'number', minimum: 4, maximum: 20, default: 8 },
        max: { type: 'number', minimum: 4, maximum: 20, default: 10 },
        scale: { type: 'number', minimum: 1, maximum: 10, default: 4 },
        rows: { type: 'number', minimum: 1, maximum: 20, default: 4 },
        lastDrink: { type: 'string', default: 'never' },
        streak: { type: 'number', default: 0 },
        history: {
            type: "array", default:
                [{
                    cups: 0, date: (new Date()).toISOString()
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

