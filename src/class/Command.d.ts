import { Message, PermissionString } from 'discord.js';
/** @classdesc Reperesenting a discord command */
class Command {

    name : string;
    dev_only : boolean;
    bot_permissions : Array<PermissionString>;
    permissions : Array<PermissionString>;
    triggers : Array<string>;
    run : ((message : Message, args : Array<any> )=> any);

    /**
     * @param {string} name Name of the command.
     * @param {Array<string>} triggers The words that will trigger the commands.
     * @param {boolean} dev_only Is the command only usable by the devs?
     * @param {Array<PermissionString>} permissions The permissions the user should have to use the bot.  
     * @param {function} run The function that will run when command executes.
     */
    constructor({
                    name,
                    triggers,
                    dev_only,
                    permissions,
                    bot_permissions
                } : {
                    name: string,
                    triggers?: Array<string>,
                    dev_only?: boolean,
                    permissions?: Array<PermissionString>,
                    bot_permissions?: Array<PermissionString>
                }, run : ((message : Message, args : Array<string> )=> Promise<string|Array<String|object>|object>|string|Array<String|object>|object ) = function(message, args) { return 'command.incomplete' }) {

        this.run = run

        this.name = name
        this.dev_only = dev_only || false
        this.triggers = [ name, ...triggers ] || [ name ]

        this.permissions = permissions || []
        this.bot_permissions = bot_permissions || []
    }

    /**
     * 
     * @param {Message} message The used message.
     * @param {string} usedPrefix The configured prefix.
     * @returns {({Array<string>,string})} Object representing the arguments and the command string
     */
    static getArgs(message : Message, usedPrefix : string) : {args : Array<string>, command : string} {
        const { content } = message
        const prefixLength = usedPrefix.length || process.env.PREFIX.length || 1
        const args = content.slice(prefixLength).trim().split(/ +/g)
        const command = args.shift().toLowerCase()
        return { args, command }
    }

    /**
     * Returns true if the prefix was used or the bot was mentioned.
     * Returns false otherwise.
     * @param {Message} message The used message
     * @param {string} prefix The configured prefix
     * @param {boolean} isMentioningBot If the user mentioned the bot. Defaults to false
    **/
    static isUsingPrefix(message : Message, usedPrefix : string, isMentioningBot = false ) : boolean {
        const { content } = message
        return !(
            !isMentioningBot && // If the author of the message is mentioning the bot, the below condition is ignored
            content.toLowerCase().trim().indexOf(usedPrefix.toLowerCase().trim()) !== 0 // If the beginning of the string IS NOT the same as the prefix being used
        )
    }

    /**
     * Returns an error message string if not allowed
     * Returns true if allowed
     * @param {Message} message The used message
     * @param {Command} command  The used command
     * @returns {(boolean|string)} Object reperesenting the error or true
     */
    static isAllowed(message : Message, command : Command) : boolean|string {

        const { member, guild, channel } = message



        /// DEVELOPER
        if (process.env.DEVELOPERS.includes(member.id)) {
            return true
        }
        if (command.dev_only && !process.env.DEVELOPERS.includes(member.id)) {
            return 'This command is for developers only.'
        }

        if(command.permissions[0] && command.permissions.some(p => !member.hasPermission(p))){
            return true
        }

        if(command.bot_permissions[0] && command.bot_permissions.some(p => !message.guild.me.hasPermission(p))){
            return "I think I'm missing some permissions. Please make sure I have the following permissions in this server: \n" + command.bot_permissions.map(l => l.concat("\n"))
        }

        if(!command.permissions[0] && !command.dev_only){
            return true
        }

        else return "I don't think you have permission to do this."

    }

}


export default Command
