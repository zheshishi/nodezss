module.exports = app => {
    class SuccessController extends app.Controller {
        *index() {
            const token = this.app.jwt.sign({ foo: 'bar' }, this.app.config.jwt.secret);
            console.log(this.ctx.state.user)
            this.ctx.body = this.ctx.state.user;
        }
    }
    return SuccessController;
};
