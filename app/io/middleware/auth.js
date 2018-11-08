'use strict';

module.exports = () => {
    return async (ctx, next) => {
        const say = await ctx.service.user.say();
        ctx.socket.emit('res', 'HELLOVAN');

        await next();
        console.log('disconnect!');
    };
};