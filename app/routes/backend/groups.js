var express = require('express');
var router = express.Router();
const util = require('util');

const systemConfig  = require(__path_configs + 'system');
const notify        = require(__path_configs + 'notify');
const GroupsModel    = require(__path_schemas + 'groups');
const validateGroups = require(__path_validates + 'groups');
const UtilsHelpers  = require(__path_helpers + 'utils');
const ParamsHelpers = require(__path_helpers + 'params');
const linkIndex     = '/' + systemConfig.prefixAdmin + '/groups/';

const pageTitleIndex = 'Group Managerment';
const pageTitleAdd   = pageTitleIndex + '- Add';
const pageTitleEdit  = pageTitleIndex + '- Edit';
const folderView     = __path_views+ 'pages/groups/';

//get video listing
router.get('(/status/:status)?', async(req,res,next) => {
    let objWhere       = {};
    let keyword        = ParamsHelpers.getParam(req.query,'keyword','');
    let currentStatus  = ParamsHelpers.getParam(req.params,'status','All');
    let statusFilter   = await UtilsHelpers.createFilterStatus(currentStatus,'groups');
    let sortField      = ParamsHelpers.getParam(req.session,'sort_field','name');
    let sortType       = ParamsHelpers.getParam(req.session,'sort_type','asc');
    let sort           = {};
    sort[sortField]      = sortType;


    let pagination = {
        totalItems       : 1,
        totalItemsPerPage: 5,
        currentPage      : parseInt(ParamsHelpers.getParam(req.query,'page',1)),
        pageRanges       :3
    };

    
    if(currentStatus === 'All'){
        if(keyword !== "") objWhere = {name:new RegExp(keyword,'i')};
    }else{
        objWhere = {status:currentStatus,name:new RegExp(keyword,'i')}
    }

    // if(currentStatus !== 'all') objWhere.status  =  currentStatus;
    // if(keyword !== '') objWhere.name = new RegExp(keyword,'i');

     await GroupsModel.count({}).then((data) =>{
        pagination.totalItems = data;
        
    })

    console.log(pagination.totalItems)
    GroupsModel
        .find(objWhere)
        .select('name status ordering created modified group_acp')
        .sort(sort)
        .limit(pagination.totalItemsPerPage)
        .skip((pagination.currentPage-1)*pagination.totalItemsPerPage)
        .then((items) => {
            res.render(`${folderView}list`, { 
                pageTitle: pageTitleIndex ,
                items,
                statusFilter,
                pagination,
                currentStatus,
                keyword,
                sortField,
                sortType
            });
        }); 
    
});

//change group
router.get('/change-group-acp/:id/:group_acp',function(req,res,next){
    let currentGroupACP  = ParamsHelpers.getParam(req.params,'group_acp','yes');
    let id             = ParamsHelpers.getParam(req.params,'id','');
    let groupACP         = (currentGroupACP === 'yes') ? "no" : "yes";
    let data           = {
        group_acp: groupACP,
        modified:{
            user_id: 0,
            user_name: "admin",
            time: Date.now()
        }
    }
    GroupsModel.updateOne({_id : id},data, (err, result) => {
        req.flash('success',notify.CHANGE_GROUP_ACP_SUCCESS,false); //false la khong can render ra view vì đã render ra view r
        res.redirect(linkIndex);
    });   
});

//change status- multi
router.post('/change-status/:status',(req,res,next) => {
    let currentStatus  = ParamsHelpers.getParam(req.params,'status','Active');
    let data           = {
        status  : currentStatus,
        modified:{
            user_id: 0,
            user_name: 0,
            time: Date.now()
        }
    }
    GroupsModel.updateMany({_id : {$in: req.body.cid}},data, (err, result) => {
        req.flash('success',util.format(notify.CHANGE_STATUS_MULTI_SUCCESS,result.n),false);
        //notify tu khoa untilities
        res.redirect(linkIndex);
    }); 
});

//change ordering multi
router.post('/change-ordering',(req,res,next) => {
    let cids = req.body.cid;
    let orderings = req.body.ordering;
    if(Array.isArray(cids)){
        let data = {
            ordering  : parseInt(orderings[index]),
            modified:{
                user_id: 0,
                user_name: 0,
                time: Date.now()
            }
        }
         cids.forEach((item,index) => {
            GroupsModel.updateOne({_id : item},data, (err, result) => {
                
            });
         })

    }else{
        let data = {
            ordering  : parseInt(orderings[index]),
            modified:{
                user_id: 0,
                user_name: 0,
                time: Date.now()
            }
        }
        GroupsModel.updateOne({_id : cids},data, (err, result) => {
        });
    }
    req.flash('success',notify.CHANGE_ORDERING_SUCCESS,false);
    res.redirect(linkIndex);   
});

//delete
router.get('/delete/:id',function(req,res,next){
    
    let id  = ParamsHelpers.getParam(req.params,'id','');
    
    GroupsModel.deleteOne({_id : id}, (err, result) => {
        req.flash('success',notify.DELETE_SUCCESS,false);
        res.redirect(linkIndex);
    });   
});

//delete-multi
router.post('/delete',function(req,res,next){
    
    GroupsModel.remove({_id : {$in: req.body.cid}}, (err, result) => {
        req.flash('success',util.format(notify.DELETE_MULTI_SUCCESS,result.n),false);
        res.redirect(linkIndex);
    });
});


//form
router.get('/form(/:id)?',(req,res,next) =>{
    let id        = ParamsHelpers.getParam(req.params,'id','');
    let item      = {name: '',ordering : 0,status:'novalue'}
    let errors    = null;
    if(id === ''){
        //them moi
        res.render(`${folderView}form`,{pageTitle: pageTitleAdd,item,errors});
    }else{
        //cap nhat
        GroupsModel.findById(id, (err, item) =>{
            res.render(`${folderView}form`,{pageTitle: pageTitleEdit, item,errors});
        });
       
    }
    
});

//add
router.post('/save',function(req,res,next){
    // res.send(req.body);
    req.body = JSON.parse(JSON.stringify(req.body));

    validateGroups.validator(req);
    let item = Object.assign(req.body);
    let errors = req.validationErrors();

    if(typeof item !== "undefined" && item.id !== ""){//edit
        if(errors){//error
            res.render(`${folderView}form`,{pageTitle: pageTitleEdit, item, errors});
        }else{
            //no error
            GroupsModel.updateOne({_id : item.id},{
                ordering : parseInt(item.ordering),
                name: item.name,
                status: item.status,
                content: item.content,
                group_acp: item.group_acp,
                modified:{
                    user_id: 0,
                    user_name: 0,
                    time: Date.now()
                }
            }, (err, result) => {
                req.flash('success',notify.EDIT_SUCCESS,false);
                res.redirect(linkIndex);
            });
        }
    }else{//add
        if(errors){//error
            res.render(`${folderView}form`,{pageTitle: pageTitleAdd, item, errors});
        }else{
            //no error
            item.created = {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
            }
            new GroupsModel(item).save().then(()=>{
                req.flash('success',notify.ADD_SUCCESS,false);
                res.redirect(linkIndex);
            })
        }
    }

    
});

//sort
router.get('/sort/:sort_field/:sort_type',(req,res,next) =>{
    req.session.sort_field        = ParamsHelpers.getParam(req.params,'sort_field','ordering');
    req.session.sort_type         = ParamsHelpers.getParam(req.params,'sort_type','asc');


    res.redirect(linkIndex);
});
module.exports = router;