('use strict');

console.log('RunID: %d', Math.floor(Math.random() * 100));

import {
	ChatInputCommandInteraction,
	Client,
	Collection,
	Events,
	GatewayIntentBits,
} from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { inviteLink } from './config.js';
import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.get('/', (req: any, res: any) => {
	res.status(200).end();
});
app.get('/invite', (req: any, res: any) => {
	res.redirect(inviteLink);
});

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.GuildPresences,
	],
});

client.on('debug', console.log).on('warn', console.log);

let g = {
	commands: new Collection(),
};

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = await import(filePath);
	g.commands.set(command.data.name, command);
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs
	.readdirSync(eventsPath)
	.filter((file) => file.endsWith('.js'));
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = await import(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Keep in index
client
	.on(Events.ClientReady, (readyClient) => {
		console.log('Client#ready fired.');
		if (!readyClient.user) return;
		readyClient.user.setPresence({
			status: 'online',
		});
	})
	.on(Events.InteractionCreate, async (interaction) => {
		if (!interaction.isChatInputCommand()) return;
		await interaction.deferReply();
		const command: any = g.commands.get(interaction.commandName);
		if (!command || 'execute'! in command) return;
		try {
			await command.execute(interaction);
		} catch (e) {
			console.error(e);
			await interaction.reply({
				content: 'There was an error while running this command.',
				ephemeral: true,
			});
		}
	});

client.login(process.env.TOKEN).catch((e) => console.log(e));

process.on('SIGINT', () => {
	client.destroy();
	console.log('Destroyed Client.');
	process.exit(0);
});

app.listen(443);
