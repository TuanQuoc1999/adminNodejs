var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const databaseConfig = require(__path_configs + 'database');

var schema = new Schema({
    name: String,
    status: String,
    ordering: Number,
    content: String,
    group_acp: String,
    created: {
        user_id: Number,
        user_name: String,
        time: Date
    },
    modified: {
        user_id: Number,
        user_name: String,
        time:Date
    },
});

module.exports = mongoose.model(databaseConfig.col_groups,schema);