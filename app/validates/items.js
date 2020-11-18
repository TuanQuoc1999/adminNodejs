const notify  = require(__path_configs + 'notify');
const util    = require('util');

const options = {
    name: { min:5, max:20 },
    ordering: { min:0, max:100 },
    status: { value: 'novalue'},
    content: { min: 5, max: 200}
    // status:{value:'novalue'}
}
module.exports = {
    validator: (req) =>{
        req.checkBody('name', util.format(notify.ERROR_NAME,options.name.min,options.name.max))
        .isLength({min: options.name.min, max: options.name.max})

        req.checkBody('ordering',util.format(notify.ERROR_ORDERING,options.ordering.min,options.ordering.max))
        .isInt({gt:options.ordering.min, lt: options.ordering.max});
        // req.checkBody('status',"Status phải khác rỗng").isNotEqual('novalue');

        //content
        req.checkBody('content', util.format(notify.ERROR_NAME,options.content.min,options.content.max))
        .isLength({min: options.content.min, max: options.content.max})
    }
};