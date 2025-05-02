# 💧 Water Tracker CLI — Stay Hydrated!
Track your daily water intake from the terminal. Made with Node and has some customizability.  
For myself, a chronic dehydrate.  

<img src="https://github.com/user-attachments/assets/cc095adf-37ed-44ef-9064-fa8b89e70ece" width="800">

## Install  
```bash
npm install -g watracker
```

## Usage

```bash
watracker [command] [options]
```
Note: I recommend aliasing it to 'wat' or something.


## Commands

| Command     | Description                     |
|-------------|---------------------------------|
| `d`, `drink`     | Log a cup of water              |
| `u`, `undrink`   | Remove a cup from today         |
| `s`, `set`       | Set configuration options       |

## Config Options (for `set`)

- `goal` – daily goal (e.g. `goal=8`)
- `max` – how many cups to show full bar (e.g. `max=12`)
- `scale` – how much each cup adds (e.g. `scale=4`)
- `rows` – how many days to show (e.g. `rows=3`)

## Examples

```bash
watracker d                    # You drank a cup
watracker u                    # You undrank a cup
watracker set goal=8           # Set goal to 8 cups
watracker set max=12           # Set max to 12 cups
watracker set scale=1.25       # Each cup adds 1.25 progress
watracker set rows=3           # Show data for 3 days
```
