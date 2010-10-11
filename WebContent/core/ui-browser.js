/*!
* Aloha Editor
* Author & Copyright (c) 2010 Gentics Software GmbH
* aloha-sales@gentics.com
* Licensed unter the terms of http://www.aloha-editor.com/license.html
*/

/**
 * !!!! ATTENTION !!!!
 * This is work in progress. This implemenation may change heavily.
 * Not yet implemented:
 * - onSelect Event!
 * - configuring and templating the list
 * - DnD
 * - passing all possible query attributes to the repository
 * - query of subtree
 * - icon representation
 */
GENTICS.Aloha.ui.Browser = function () {

	var that = this;
	
	// define the grid that represents the filelist
	this.grid = new Ext.grid.GridPanel( {
		region : 'center',
		autoScroll : true,
		// the datastore can be used by the gridpanel to fetch data from
		// repository manager
		store : new Ext.data.Store( {
			proxy : new Ext.data.AlohaProxy(),
			reader : new Ext.data.AlohaObjectReader()
		}),
		columns : [ {
			id : 'displayName',
			header : 'Name',
			width : 100,
			sortable : true,
			dataIndex : 'displayName'
		}, {
			header : 'URL',
			renderer : function(val) {
				return val;
			},
			width : 300,
			sortable : true,
			dataIndex : 'url'
		} ],
		stripeRows : true,
		autoExpandColumn : 'displayName',
		height : 350,
		width : 600,
		title : 'Objectlist',
		stateful : true,
		stateId : 'grid'
	});

	// define the treepanel
	this.tree = new Ext.tree.TreePanel( {
		region : 'center',
		useArrows : true,
		autoScroll : true,
		animate : true,
		enableDD : true,
		containerScroll : true,
		border : false,
		loader : new Ext.tree.AlohaTreeLoader(),
		root : {
			nodeType : 'async',
			text : 'Aloha Repositories',
			draggable : false,
			id : 'aloha'
		},
		rootVisible : false,
		listeners : {
			'beforeload' : function(node) {
				this.loader.baseParams = {
					node : node.attributes
				};
			}
		}
	});
	
    this.tree.getSelectionModel().on({
        'selectionchange' : function(sm, node){
            if(node){
                this.tree.fireEvent('alohatreeselect', node.attributes);
            }
        },
        scope:this
    });
    
    this.tree.addEvents({alohatreeselect:true});
    
    this.tree.on('alohatreeselect', function(resourceItem) {
		that.grid.store.load({ params: {
			inFolderId: resourceItem.id,
			objectTypeFilter: that.objectTypeFilter,
			repositoryId: resourceItem.repositoryId
		}});
    });

	// nest the tree within a panel
	this.nav = new Ext.Panel( {
		title : 'Navigation',
		region : 'west',
		width : 300,
		layout : 'fit',
		collapsible : true,
		items : [ this.tree ]
	});
				
	// add the nested tree and grid (filelist) to the window
	this.win = new Ext.Window( {
		title : 'Resource Selector',
		layout : 'border',
		width : 800,
		height : 300,
		closeAction : 'hide',
		plain : true,
		initHidden: true,
		items : [ this.nav, this.grid ],
		buttons : [{
			text : 'Close',
			handler : function() {
				that.win.hide();
			}
		}, {
			text : 'Select',
			disabled : true
		}],
	    toFront : function(e) {
	        this.manager = this.manager || Ext.WindowMgr;
	        this.manager.bringToFront(this); 
	        this.setZIndex(9999999999); // bring really to front (floating menu is not registered as window...)
	        return this;
	    }
	});
};
	
GENTICS.Aloha.ui.Browser.prototype.setObjectTypeFilter = function(otf) {
	this.objectTypeFilter = otf;
};

GENTICS.Aloha.ui.Browser.prototype.getObjectTypeFilter = function() {
	return this.objectTypeFilter;
};

GENTICS.Aloha.ui.Browser.prototype.show = function() {
	this.win.show(); // first show,
	this.win.toFront(true);
};
