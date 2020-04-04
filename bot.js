// Author = SmallDoink#0666
// Features:
//    Greets users when they join
//    Kick Users
//    Ban Users
//    Mute Users
//    Unmute Users
//    Purge Messages
//    Blacklisted Words
//    Add words to blacklist
//    Ping (for fun i guess)
//    Help/Commands
//    Antispam
'use strict';
const discord = require('discord.js');
const client = new discord.Client();
const antispam = require('discord-anti-spam');
const spam = new antispam({
  warnThreshold: 20,
  maxBuffer: 10,
  maxInterval: 2000,
  banThreshold: 70000,
  kickThreshold: 7000,
  warnMessage: '{@user}, stop spamming!',
  kickMessage: '**{user_tag}** has been kicked for spamming!',
  banMessage: '**{user_tag}** has been banned for spamming!',
  maxDuplicatesWarning: 5,
  exemptPermissions: ['ADMINISTRATOR'],
  ignoreBots: true,
  verbose: true,
  ignoredUsers: [],
  exemptRoles: [],
  exemptUsers: ["SmallDoink#0666"]
});

var blacklistedWords = ["nigger", "asshole"];
var prefix = '!';

// Client on ready or when it starts
client.on('ready', () => {
  console.log('[#] Logged in as', client.user.tag);
  client.user.setActivity('Watching !help', { type: 'WATCHING' });
});

// When someone joins, send a message here
client.on('guildMemberAdd', member => {
  var channel = member.guild.channels.cache.find(ch => ch.name === 'welcome'); // Find channel named "welcome"
  if (!channel) return;
  channel.send(`Welcome to the server, ${member}`); // Send welcome to the server
});

client.on('message', msg => {
  spam.message(msg) // Push each message into the antispam module

  if (!msg.guild) return; // If the message isn't in a server, don't reply

  // Start of Ban Function
  if (msg.content.startsWith(`${prefix}ban`)) {
    var user = msg.mentions.users.first();
    if (user) {
      var member = msg.guild.member(user);
      if (member) {
        if (msg.member.hasPermission('BAN_MEMBERS')) {
          member.ban({
            reason: 'Not following the rules',
          }).then(() => {
            msg.reply('Banned', user.tag);
          }).catch(err => {
            msg.reply('I cannot ban that user');
            console.error(err);
          });
        }
        if (!msg.member.hasPermission('BAN_MEMBERS')) {
          msg.reply('You do not have permissions to do that');
        }
      } else {
        msg.reply("That user isn't in this server");
      }
    } else {
      msg.reply("You didn't mention a user to ban");
    }
  }

  // Start of kick function
  if (msg.content.startsWith(`${prefix}kick`)) {
    var user = msg.mentions.users.first();
    if (user) {
      var member = msg.guild.member(user);
      if (member) {
        if (msg.member.hasPermission(['KICK_MEMBERS'])) {
          member.kick('Not following the rules').then(() => {
            msg.channel.send('Successfully Kicked!');
          }).catch(err => {
            msg.reply('I cannot kick that user');
            console.error(err);
          });
        }
        if (!msg.member.hasPermission('KICK_MEMBERS')) {
          msg.reply('You do not have permissions to do that');
        }
      } else {
          msg.reply("That user isn't in this server");
        }
    } else {
        msg.reply("You didn't mention a user to ban");
      }
    }

  // Start of mute function
  if (msg.content.startsWith(`${prefix}mute`)) {
    var user = msg.mentions.users.first();
    if (user) {
      var member = msg.guild.member(user);
      if (member) {
        if (msg.member.hasPermission(['MANAGE_ROLES'])) {
          let muted = msg.guild.roles.cache.find(role => role.name === "Muted");
          member.roles.add(muted)
          msg.reply(`Successfully Muted ${member}`);
        }
        if (!msg.member.hasPermission('MANAGE_ROLES')) {
          msg.reply('You do not have permissions to do that');
        }
      } else {
        msg.reply("This user isn't in this server");
      }
    } else {
      msg.reply("You didn't mention a user to mute");
    }
  }

  // Start of unmute function
  if (msg.content.startsWith(`${prefix}unmute`)) {
    var user = msg.mentions.users.first();
    if (user) {
      var member = msg.guild.member(user);
      if (member) {
        if (msg.member.hasPermission(['MANAGE_ROLES'])) {
        let muted = msg.guild.roles.cache.find(role => role.name === "Muted");
        member.roles.remove(muted)
        msg.reply(`Successfully Unmuted ${member}`)
      }
      if (!msg.member.hasPermission('MANAGE_ROLES')) {
        msg.reply('You do not have permissions to do that');
      }
      } else {
        msg.reply("This user isn't in this server");
      }
    } else {
      msg.reply("You didn't mention a user to unmute");
    }
  }

  // Start of purge function
  if (msg.content.startsWith(`${prefix}purge`)) {
    var args = msg.content.split(' ').slice(1);
    var amount = args.join('')

    if (!amount) return msg.reply('You must specify an amount of messages to erase');
    if (isNaN(amount)) return msg.reply('You must give a number');

    if (amount > 100) return msg.reply('You can not delete more than 100 messages');
    if (amount < 1) return msg.reply('You must delete at least 1 message');

    if (msg.member.hasPermission(['MANAGE_MESSAGES'])) {
      msg.channel.messages.fetch({
        limit: amount
      }).then(messages => {
        msg.channel.bulkDelete(messages);
        msg.channel.send(`Successfully Deleted ${amount} Messages!`)
      });
    }
    if (!msg.member.hasPermission('MANAGE_MESSAGES')) {
      msg.reply('You do not have permissions to do that');
    }
  }

  // Start of word blacklist function
  if (blacklistedWords.some(word => msg.content.toLowerCase().includes(word)) ) {
    if (!msg.member.hasPermission(['ADMINISTRATOR'])) {
      msg.delete()
      msg.channel.send(`${msg.member}, that word is now allowed.`);
    } else {
      if (msg.author.id === client.user.id) return;
      msg.reply(`You cannot say that word ${msg.member}! Even though you're admin you cannot say it!!`);
    }
  }

  // Start of add word to blacklist function
  if (msg.content.startsWith(`${prefix}addBlacklist`)) {
    var args = msg.content.split(' ').slice(1);
    var word = args.join('')

    if (!word) return msg.reply('You must specify a word to blacklist');
    if (!isNaN(word)) return msg.reply('You cannot blacklist a number');
    blacklistedWords.push(word);
    msg.channel.send(`"${word}" has been blacklisted succesfully!`);
  }


  // Start of rules function
  if (msg.content == `${prefix}rules`) {
    var embed = new discord.MessageEmbed()
      .setTitle('Server Rules')
      .setColor('0xff0000')
      .setDescription('No Offensive Language\nNo Racism, Sexism, or Ageism\nNo rumors, secrets, problems, drama, or toxicity\nNo Blackmailing\nNo Trolling')
      .setAuthor('Server Rules')
      .setFooter('Bot coded by SmallDoink#0666');
    msg.channel.send(embed);
  }

  // Start of help/commands function
  if (msg.content == `${prefix}help` || msg.content == `${prefix}commands`) {
    var embed = new discord.MessageEmbed()
      .setTitle('Commands')
      .setColor('0xff0000')
      .setDescription(`**${prefix}kick** - Kick a member\n**${prefix}ban** - Ban a member\n**${prefix}mute** - Mute a member\n**${prefix}unmute** Unmute a member\n**${prefix}purge** - Purge messages\n**${prefix}addBlacklist** - Add word to blacklist\n**${prefix}rules** - Display the rules`)
      .setFooter('Bot coded by SmallDoink#0666');
    msg.channel.send(embed);
  }

  if (msg.content.startsWith(`${prefix}prefix`)) {
    var args = msg.content.split(' ').slice(1);
    var pprefix = args.join('');
    if (!pprefix) return msg.reply('You must specify a character to prefix');
    if (!isNaN(word)) return msg.reply('You cannot set the prefix to a integer');

    prefix = pprefix;
    msg.reply(`Succesfully set the prefix to "${prefix}"`);
  }

  // Just a little fun
  if (msg.content == `${prefix}ping`) {
    msg.channel.send('Pong!');
  }
});

// discord bot login with token
client.login('BOT TOKEN');
