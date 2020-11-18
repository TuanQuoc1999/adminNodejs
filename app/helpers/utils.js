const itemsModel = require(__path_schemas + 'items');

let createFilterStatus = async (currentStatus, collection) => {
    const currentModel = require(__path_schemas + collection);

    let statusFilter = [
        {name: 'All', value: 'All', count: 1,  class: 'default'},
        {name: 'Active',value: 'Active', count: 2,  class: 'default'},
        {name: 'InActive',value: 'InActive', count: 3,  class: 'default'}
    ];

    // statusFilter.forEach(async (item,index) =>{
    for(let index = 0; index< statusFilter.length;index++){
        let item = statusFilter[index];
        let condition = (item.value !== "All") ? {status: item.value} : {};

        if(item.value === currentStatus) statusFilter[index].class = 'success';

        await currentModel.count(condition).then((data) => {
            statusFilter[index].count = data;

        });
    }
    return statusFilter;
}

module.exports = {
    createFilterStatus: createFilterStatus
}