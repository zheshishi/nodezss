("use strict");

module.exports = app => {
    class RenderController extends app.Controller {
        *index() {
            this.ctx.body = "hello World";
            var token = app.jwt.sign({ foo: 'bar' }, 'shhhhh');
        }
    }
    return RenderController;
};
