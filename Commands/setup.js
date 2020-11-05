const Discord = require('discord.js')
const colors = require('../colors.json')
const client = require('../index.js')

module.exports = {
    name: 'setup',
    async execute(message, args) {
        if (!message.guild.me.hasPermission("MANAGE_GUILD")) return message.channel.send('Missing Permissions: `MANAGE_SERVER`')
        if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have permission to use this command! `MANAGE_SERVER`")


        let support = message.guild.roles.cache.find(r => r.name === "Modmail-Support")

        if(support) {
            support.delete()
            await message.guild.roles.create({
                data: {
                    name: 'Modmail-Support',
                    color: "RANDOM",
                    permissionOverwrites: [
                        {
                            id: support.id,
                            allow: ['SEND_MESSAGES', "VIEW_CHANNEL"]
                        }
                    ]
                }
            })
        } else {
            await message.guild.roles.create({
                data: {
                    name: 'Modmail-Support',
                    color: "RANDOM"
                }
            })
        }

        await message.guild.channels.create('MODMAIL', {
            type: "category",
            permissionOverwrites: [{
                id: message.guild.roles.cache.find(r => r.name === "Modmail-Support").id,
                allow: ['SEND_MESSAGES', 'VIEW_CHANNEL']
            }, 
            {
                id: message.guild.id,
                deny: 'VIEW_CHANNEL'
            }]
        })
        await message.guild.channels.create('modmail-logs', {
            type: 'text',
            permissionOverwrites: [{
                id: message.guild.roles.cache.find(r => r.name === "Modmail-Support").id,
                allow: ['SEND_MESSAGES', 'VIEW_CHANNEL']
            }, 
            {
                id: message.guild.id,
                deny: 'VIEW_CHANNEL'
            }]
        })
        let modmailLog = message.guild.channels.cache.find(c => c.name === 'modmail-logs')
        let modmailCategory = message.guild.channels.cache.find(ch => ch.name === "MODMAIL")
        await modmailLog.setParent(modmailCategory.id)
        await message.channel.send({
            embed: {
                title: "Success",
                description: `I have created the channel ${modmailLog} under the category ${modmailCategory}. Only people with the ${message.guild.roles.cache.find(r => r.name === "Modmail-Support")} can view this channel`
            }
        })
    }
}