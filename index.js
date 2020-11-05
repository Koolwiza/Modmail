// Require Modules //

const Discord = require('discord.js')
const fs = require('fs')
const chalk = require('chalk')

// Define client, commands, etc //
const client = new Discord.Client()
client.commands = new Discord.Collection()
const colors = require('./colors.json')
const {
    PREFIX,
    token,
    GUILD
} = require('./config.json')
const {
    toUnicode
} = require('punycode')

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

// Command Handler //

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.clear()
    console.log(`${client.user.tag} is online serving ${client.guilds.cache.size} guilds!`)
    client.user.setActivity(`my DM's`, {
        type: "PLAYING"
    })

})

client.on('message', async message => {
    let guild = message.client.guilds.cache.find(g => g.id === GUILD)

    let modmailLog = guild.channels.cache.find(c => c.name === "modmail-logs")
    let modmailCategory = guild.channels.cache.find(c => c.name === "MODMAIL")
    let channelName = `${message.author.username}-${message.author.discriminator}`.toLowerCase()
    let firstAuthor = guild.channels.cache.find(ch => ch.name === channelName)


    if (message.author.bot) return

    if (message.channel.type === "dm") {

        if (!firstAuthor) {
            guild.channels.create(message.author.tag.split("#").join("-"), {
                type: 'text',
                reason: "Modmail",
                permissionOverwrites: [{
                    id: guild.roles.cache.find(r => r.name === "Modmail-Support").id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                }, {
                    id: guild.id,
                    deny: ['VIEW_CHANNEL']
                }]
            }).then(async m => {
                m.setParent(modmailCategory.id)
                m.send({
                    embed: {
                        color: colors.blue,
                        description: `Type a message in this channel to reply. Messages starting with the server prefix \`$\` are ignored, and can be used for staff discussion. Use the command \`$close [reason]\` to close this thread.`,
                        title: 'New thread',
                        footer: {
                            text: `${message.author.tag} | ${message.author.id}`,
                            icon_url: message.author.displayAvatarURL()
                        },
                        timestamp: new Date()
                    }
                })

                await modmailLog.send({
                    embed: {
                        title: 'New Thread Created',
                        color: colors.blue,
                        footer: {
                            text: `${message.author.tag} | ${message.author.id}`,
                            icon_url: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        },
                        timestamp: new Date()
                    }
                })

                m.send({
                    embed: {
                        color: colors.green,
                        description: message.content,
                        title: 'Message Received',
                        footer: {
                            text: `${message.author.tag} | ${message.author.id}`,
                            icon_url: message.author.displayAvatarURL()
                        },
                        timestamp: new Date()
                    }
                })
                message.author.send({
                    embed: {
                        title: 'Message Sent',
                        description: message.content,
                        footer: {
                            text: guild.name,
                            icon_url: guild.iconURL({
                                dynamic: true
                            })
                        },
                        timestamp: new Date(),
                        color: colors.green
                    }
                })
            })
        } else {
            await firstAuthor.send({
                embed: {
                    color: colors.green,
                    description: message.content,
                    title: 'Message Received',
                    footer: {
                        text: `${message.author.tag} | ${message.author.id}`,
                        icon_url: message.author.displayAvatarURL()
                    },
                    timestamp: new Date()
                }
            })
            await message.author.send({
                embed: {
                    title: 'Message Sent',
                    description: message.content,
                    footer: {
                        text: guild.name,
                        icon_url: guild.iconURL({
                            dynamic: true
                        })
                    },
                    timestamp: new Date(),
                    color: colors.green
                }
            })
            
        }
    } else {
        if (message.guild.channels.cache.find(c => c.name === "MODMAIL")) {
            if (message.channel.parentID === message.guild.channels.cache.find(c => c.name === "MODMAIL").id) {

                if (!message.content.startsWith(PREFIX)) {
                    let channelName = `${message.channel.name.split("-")[0]}`
                    let channelTag = message.channel.name.split("-")[1]
                    let User = message.guild.members.cache.find(r => r.user.tag.toLowerCase() === `${channelName}#${channelTag}`)
                    message.delete()

                    let receiveEmbed = new Discord.MessageEmbed()
                        .setTitle('Message Sent')
                        .setAuthor(message.author.tag, message.author.displayAvatarURL({
                            dynamic: true
                        }))
                        .setDescription(message.content)
                        .setColor(colors.orange)
                        .setFooter(`${message.author.tag} | ${message.author.id}`)
                        .setTimestamp()
                    message.channel.send(receiveEmbed)

                    let messageReceiveEmbed = new Discord.MessageEmbed()
                        .setTitle('Message Received')
                        .setAuthor(message.author.tag, message.author.displayAvatarURL({
                            dynamic: true
                        }))
                        .setDescription(message.content)
                        .setColor(colors.orange)
                        .setFooter(`${message.guild.name} | ${message.guild.id}`)
                        .setTimestamp()
                    User.send(messageReceiveEmbed)
                }
            }
        }

    }

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;
    try {
        command.execute(message, args, client);
        console.log(chalk.greenBright('[COMMAND]'), `${message.author.tag} used the command ` + commandName)
    } catch (error) {
        console.log(error);
        message.reply('there was an error trying to execute that command! ```\n' + error + "\n```");
    }
})



client.login(token)