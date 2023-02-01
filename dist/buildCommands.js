import { Routes } from 'discord.js';
import { REST } from '@discordjs/rest';
import { clientId } from './config.js';
import TOKEN from './TOKEN.js';
import 'node:process';
let args = process.argv;
args.shift();
args.shift();
import fs from 'node:fs';
import { dirname, default as path } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
let commandFiles;
if (args.length == 0) {
	commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.js'));
} else {
	commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.js') && args.includes(file));
}
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = await import(filePath);
	commands.push(command.data.toJSON());
}
const rest = new REST({ version: '10' }).setToken(TOKEN);
await rest.put(Routes.applicationCommands(clientId), { body: [] });
await rest.put(Routes.applicationCommands(clientId), { body: commands });
console.log(await rest.get(Routes.applicationCommands(clientId)));
