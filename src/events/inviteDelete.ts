import {
	EmbedBuilder,
	Events,
	Invite,
	channelMention,
	time,
	userMention
} from 'discord.js';
import { getGuildAuditLoggingChannel } from './a.getGuildConf';

export const name = Events.InviteDelete;
export const once = false;
export const execute = async (invite: Invite) => {
	if (!invite.guild) return;
	const guild = await invite.guild.fetch();
	await getGuildAuditLoggingChannel(guild)?.send({
		embeds: [
			new EmbedBuilder()
				.setTitle('Invite Deleted')
				.setColor(0x00ff00)
				.setTimestamp()
				.setFooter({
					iconURL: guild.members.me?.displayAvatarURL(),
					text: 'Powered by DisCog'
				})
				.setFields(
					{
						name: 'Code',
						value: invite.code
					},
					{
						name: 'URL',
						value: invite.url
					},
					{
						name: 'Channel',
						value: invite.channel ? channelMention(invite.channel.id) : 'None'
					},
					{
						name: 'Inviter',
						value: invite.inviter ? userMention(invite.inviter.id) : 'None'
					},
					{
						name: 'Expiration',
						value: invite.maxAge ? invite.maxAge.toString() : 'None'
					},
					{
						name: 'Max Uses',
						value: invite.maxUses ? invite.maxUses.toString() : 'None'
					},
					{
						name: 'Uses',
						value: invite.uses ? invite.uses.toString() : 'None'
					},
					{
						name: 'Temporary',
						value: invite.temporary ? 'Yes' : 'No'
					},
					{
						name: 'Created At',
						value: time(invite.createdTimestamp!)
					}
				)
		]
	});
};
