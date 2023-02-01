import { Events } from 'discord.js';
export const name = Events.GuildScheduledEventCreate;
export const once = false;
export const execute = async (event) => {
	if (event.guild?.systemChannel)
		await event.guild.systemChannel.send(`New Event: ${event.url}`);
};
export default {
	execute,
	name,
	once
};
